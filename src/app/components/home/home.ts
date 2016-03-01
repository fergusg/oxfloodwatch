import {Component, ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http, JSONP_PROVIDERS, Jsonp} from "angular2/http";
import {Observable} from "rxjs/Observable";

import Gauge from "./gauge";
import TimeSeries from "./timeseries";
import {LoaderAnim, MomentPipe} from "../../util";
import {DepthPipe} from "./depth-pipe";
import {normal, limit} from "./utils";
import {defaultConfig} from "../../../config";

declare var $: any;

@Component({
    selector: "home",
    providers: [JSONP_PROVIDERS],
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html",
    pipes: [MomentPipe, DepthPipe],
    directives: [LoaderAnim]
})
export abstract class HomeCmp {
    public delta = 0;
    public above = 0;
    public data: any;
    public loadError = false;
    public loaded = false;
    public messages: any;
    public state: string;
    private config: any;

    private firstLoaded = false;
    private when: any;
    private chart: any;
    private timeSeriesChart: any;
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
        let getter = this.config.jsonp
            ? this.jsonp.request(this.config.url)
            : this.http.get(this.config.url);

        getter
            .timeout(timeout, new Error("Timed out"))
            .delay(250)
            .map((res: any) => res.json())
            .subscribe(this.update.bind(this), onError.bind(this));

        this.jsonp.request(this.config.timeSeriesUrl)
            .timeout(timeout, new Error("Timed out"))
            .delay(250)
            .map((res: any) => res.json())
            .subscribe(this.updateTimeSeries.bind(this), onTSError.bind(this));


        function onError(err: any) {
            this.loadError = true;
            this.when = null;
            this.ref.detectChanges();
            console.error(err);
        }

        function onTSError(err: any) {
            console.error(err);
        }
    }

    private updateTimeSeries(odata: any, retry = true) {
        let data = odata;
        let conf = this.getLocalConfig();
        data = data.map((v) => [new Date(v[0]).getTime(), conf.normalDistance - v[1]]);
        data.sort((a, b) => a[0] - b[0] );

        let min = +Infinity;
        let max = -Infinity;
        for (let d of data) {
            if (d[1] > max) {
                max = d[1];
            }
            if (d[1] < min) {
                min = d[1];
            }
        }

        this.timeSeriesChart.series[0].setData(data, false, false);
        this.timeSeriesChart.yAxis[0].setExtremes(min, max, false, false);
        this.timeSeriesChart.redraw();

        // Strange HighCharts "bug".  Chart doesn't scale properly the 1st time around
        // so we call it again.
        if (retry) {
            setTimeout(() => this.updateTimeSeries(odata, false), 0);
        }
    }

    private update(data: any) {

        this.data = data;
        this.when = data.payload.timestamp;

        // Measured DOWN
        const distance = parseInt(data.payload.value, 10);

        this.delta = this.normalDistance - distance;

        const d = this.delta;
        const levels = this.config.levels;
        if (d >= levels.extreme) {
            this.state = "EXTREME";
            this.above = d - levels.extreme;
        } else if (d >= levels.very_high) {
            this.state = "VERY_HIGH";
            this.above = d - levels.very_high;
        } else if (d >= levels.high) {
            this.state = "HIGH";
            this.above = d - levels.high;
        } else if (d >= levels.close) {
            this.state = "CLOSE";
            this.above = d - levels.close;
        } else if (d >= levels.low) {
            this.state = "LOW";
            this.above = d - levels.low;
        } else {
            this.state = "VERY_LOW";
            this.above = null;
        }

        const [h] = limit(d, this.levels.min, this.levels.max);
        this.chart.series[0].points[0].update(h);
        this.ref.detectChanges();
        this.loaded = true;
        this.firstLoaded = true;
    }

    private initGauge(twitch: boolean = true) {
        let height = $(document).innerWidth() < 800 ? 240 : 400;
        let chartElem = $(this.elem.nativeElement).find(".chart");
        let def = new Gauge(height, () => this.delta).getDefinition();

        def.yAxis = Object.assign({}, def.yAxis, this.config.yAxis);

        chartElem.highcharts(def);
        this.chart = chartElem.highcharts();

        // Twitch needle to +/- 1 inch
        // disable in test mode, which does it's own movement
        if (twitch) {
            this.twitch();
        }
    };

    private initTimeSeries() {
        let chartElem = $(this.elem.nativeElement).find(".timeseries");
        let height = $(document).innerWidth() < 800 ? 80 : 150;
        let def = new TimeSeries(height, () => this.delta).getDefinition();

        var bands = this.getPlotBands();

        let zones = bands.map(v => { return { color: v.color, value: v.to }; });

        def = Object.assign({}, def, {
            series: [{ zones, data: [] }]
        });

        chartElem.highcharts(def);
        this.timeSeriesChart = chartElem.highcharts();

    }

    private twitch() {
        let point = this.chart.series[0].points[0];
        Observable
            .timer(1000, 1000)
            .subscribe(() => {
                let [h, limited] = limit(this.delta, this.levels.min, this.levels.max);
                h += normal(limited ? 1.0 : 2.5);
                point.update(h);
            });
    }

    private doJigger() {
        let update = this.update.bind(this);
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
        let value = this.normalDistance + normal(200);

        return {
            payload: { value, timestamp }
        };
    }

}
