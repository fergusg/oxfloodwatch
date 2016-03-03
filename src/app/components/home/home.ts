import {Component, ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http, JSONP_PROVIDERS, Jsonp} from "angular2/http";
import {Observable} from "rxjs/Observable";

import Gauge from "./gauge";
import TimeSeries from "./timeseries";
import TimeSeriesComponent from "./timeseries_component";
import {LoaderAnim, MomentPipe} from "../../util";
import {DepthPipe} from "./depth-pipe";
import {normalDist, limit} from "./utils";
import {defaultConfig} from "../../../config";

declare var $: any;

@Component({
    selector: "home",
    providers: [JSONP_PROVIDERS],
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html",
    pipes: [MomentPipe, DepthPipe],
    directives: [LoaderAnim, TimeSeriesComponent]
})
export abstract class HomeCmp {
    public delta = 0;
    public above = 0;
    public data: any;
    public timeseries: any;
    public loadError = false;
    public loaded = false;
    public messages: any;
    public state: string;
    private config: any;

    private firstLoaded = false;
    private when: any;
    private gaugeChart: any;
    private tsChart: any;
    private debug = false;
    private jigger = false;
    private timeout = false;
    private levels: any;

    private normalDistance: number;

    constructor(
        private http: Http,
        private ref: ChangeDetectorRef,
        private elem: ElementRef,
        private jsonp: Jsonp
    ) {
        this.jigger = location.search.includes("jigger");
        this.debug = location.search.includes("debug");
        this.timeout = location.search.includes("timeout");
        this.config = this.getConfig();
        this.messages = this.config.messages;
        this.levels = this.getLevels();

        this.normalDistance = this.config.normalDistance;
    }

    public abstract getLocalConfig();
    protected abstract getLevels();

    public getConfig() {
        return Object.assign(
            {},
            defaultConfig,
            {
                levels: this.getLevels()
            },
            this.getLocalConfig());
    }

    public getPlotBands() {
        let levels = this.getLevels();
        return [
            {
                from: -1000,
                to: levels.low,
                color: '#55BF3B' // green
            },
            {
                from: levels.low,
                to: levels.close,
                color: '#00e600' // green
            },
            {
                from: levels.close,
                to: levels.high,
                color: '#DDDF0D' // yellow
            },
            {
                from: levels.high,
                to: levels.very_high,
                color: '#ffa366' // orange
            },
            {
                from: levels.very_high,
                to: levels.extreme,
                color: '#ff6600' // orange
            },
            {
                from: levels.extreme,
                to: 1000,
                color: '#cc0000' // red
            }
        ];
    }

    public ngOnInit() {
        this.initTimeSeries();
        if (this.jigger) {
            this.initGauge(false);
            this.doJigger();
        } else {
            this.initGauge();
            Observable
                .timer(1000, 30000)
                .subscribe(this.load.bind(this));
        }
    }

    private load() {
        this.loaded = false;
        this.loadError = false;

        let timeout = this.timeout
            ? Math.floor(Math.random() * 150) + 50
            : 10000;

        this.ref.detectChanges();

        this.jsonp.request(this.config.timeSeriesUrl)
            .timeout(timeout, new Error("Timed out"))
            .delay(250)
            .map((res: any) => res.json())
            .subscribe(this.update.bind(this), onError.bind(this));

        function onError(err: any) {
            this.loadError = true;
            this.when = null;
            this.ref.detectChanges();
            console.error(err);
        }
    }

    private update(ts: any, retry = true) {
        let conf = this.getLocalConfig();
        let data = ts.map((v) => [new Date(v[0]).getTime(), conf.normalDistance - v[1]]);
        data.sort((a, b) => a[0] - b[0]);

        let min = +Infinity;
        let max = -Infinity;
        for (let [_, value] of data) {
            max = Math.max(max, value);
            min = Math.min(min, value);
            _ = !!_; // hack to fool linters which don't like unused vars
        }

        this.timeseries = data;
        this.tsChart.series[0].setData(data, false, false);
        this.tsChart.yAxis[0].setExtremes(min, max, false, false);
        this.tsChart.redraw();

        // Strange HighCharts behaviour.  Chart doesn't scale properly the 1st time around
        // so we call it again.
        if (retry) {
            setTimeout(() => this.tsChart.redraw(), 100);
        }

        let [timestamp, value] = data[data.length - 1];
        this.updateGauge({ "payload": { value, timestamp } });

    }

    private calcLevels(d) {
        const levels = this.config.levels;
        if (d >= levels.extreme) {
            return { state: "EXTREME", above: d - levels.extreme };
        } else if (d >= levels.very_high) {
            return { state: "VERY_HIGH", above: d - levels.very_high };
        } else if (d >= levels.high) {
            return { state: "HIGH", above: d - levels.high };
        } else if (d >= levels.close) {
            return { state: "CLOSE", above: d - levels.close };
        } else if (d >= levels.low) {
            return { state: "LOW", above: d - levels.low };
        } else {
            return { state: "VERY_LOW", above: null };
        }
    }

    private updateGauge(data: any) {
        this.data = data;
        this.when = data.payload.timestamp;

        this.delta = parseInt(data.payload.value, 10);

        let {state, above} = this.calcLevels(this.delta);
        this.state = state;
        this.above = above;

        const [h] = limit(this.delta, this.levels.min, this.levels.max);
        this.gaugeChart.series[0].points[0].update(h);
        this.ref.detectChanges();
        this.loaded = true;
        this.firstLoaded = true;
    }

    private initGauge(twitch: boolean = true) {
        let chartElem = $(this.elem.nativeElement).find(".chart");
        let def = new Gauge(() => this.delta).getDefinition();

        def.yAxis = Object.assign({}, def.yAxis, this.config.yAxis);

        chartElem.highcharts(def);
        this.gaugeChart = chartElem.highcharts();

        // Twitch needle to +/- 1 inch
        // disable in test mode, which does it's own movement
        if (twitch) {
            this.twitch();
        }
    };

    private initTimeSeries() {
        let chartElem = $(this.elem.nativeElement).find(".timeseries");
        let def = new TimeSeries().getDefinition();

        var bands = this.getPlotBands();

        let zones = bands.map(v => { return { color: v.color, value: v.to }; });

        def = Object.assign({}, def, {
            series: [{ zones, data: [] }]
        });

        chartElem.highcharts(def);
        this.tsChart = chartElem.highcharts();

    }

    private twitch() {
        let point = this.gaugeChart.series[0].points[0];
        Observable
            .timer(1000, 1000)
            .subscribe(() => {
                let [h, limited] = limit(this.delta, this.levels.min, this.levels.max);
                h += normalDist(limited ? 1.0 : 2.5);
                point.update(h);
            });
    }

    private doJigger() {
        let update = this.updateGauge.bind(this);
        Observable
            .timer(0, 5000)
            .subscribe(() => {
                this.loaded = false;
                this.ref.detectChanges();
                setTimeout(() => {
                    this.loaded = true;
                    update(this.fakeData());
                    this.ref.detectChanges();
                }, 250);
            });
    }

    private fakeData() {
        let timestamp = Date.now() - Math.round(1000 * 900 * Math.random());
        let value = this.normalDistance + normalDist(200);

        return {
            payload: { value, timestamp }
        };
    }

}
