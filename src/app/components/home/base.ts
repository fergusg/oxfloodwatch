import {Component, ChangeDetectorRef, ElementRef, OnDestroy, OnInit} from "angular2/core";
import {JSONP_PROVIDERS, Jsonp} from "angular2/http";
import {Observable} from "rxjs/Observable";

import TimeSeriesComponent from "./components/timeseries";
import GaugeComponent from "./components/gauge";
import LastReading from "./components/lastreading";

import {LoaderAnim, MomentPipe} from "../../util";
import {DepthPipe} from "./tools/depth-pipe";
import {defaultConfig} from "../../../config";

declare var $: any;
declare var _: any;

@Component({
    selector: "home",
    providers: [JSONP_PROVIDERS],
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html",
    pipes: [MomentPipe, DepthPipe],
    directives: [LoaderAnim, TimeSeriesComponent, GaugeComponent, LastReading]
})
export abstract class BaseComponent implements OnInit, OnDestroy {
    public delta = 0;
    public above = 0;
    public timeseries: any;
    public loadError = false;
    public loaded = false;
    public messages: any;
    public state: string;
    private config: any;

    private firstLoaded = false;
    private when: any;
    private debug = false;
    private jigger = false;
    private timeout = false;
    private levels: any;

    private normalDistance: number;

    constructor(
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
        let c = Object.assign(
            {},
            defaultConfig,
            {
                levels: this.getLevels()
            },
            this.getLocalConfig()
        );
        c.yAxis.plotBands = this.getPlotBands();
        return c;
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
                color: '#00e600' // light green
            },
            {
                from: levels.close,
                to: levels.high,
                color: '#DDDF0D' // yellow
            },
            {
                from: levels.high,
                to: levels.very_high,
                color: '#ffa366' // light orange
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

    public ngOnDestroy() {
        console.log("destroy");
    }

    public ngOnInit() {
        if (this.jigger) {
            // this.doJigger();
        } else {
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

        this.jsonp.request(this.config.url)
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

    private getHeight(normalDistance: number, v: number[]) {
        let [value, temp] = v.slice(1);
        if (_.isFinite(temp)) {
            let newVal = ((value * 58) * (331.3 + 0.606 * temp)) / 20000;
            // console.log(`Height ${value} -> ${newVal} (T=${temp}C)`);
            value = newVal;
        }
        return Math.round(normalDistance - value);
    }

    private update(data: any, retry = true) {
        let height = this.getHeight.bind(null, this.getLocalConfig().normalDistance);

        data = data.filter((v) => Math.abs(v[1] - 17) > 2);
        data = data.map((v) => [new Date(v[0]).getTime(), height(v)]);
        // most recent is first.  But use sort() instead ov reverse() just to be sure
        data.sort((a, b) => a[0] - b[0]);

        this.timeseries = data;

        let [timestamp, value] = data[data.length - 1];
        this.delta = parseInt(value, 10);
        this.when = timestamp;

        let levels = this.calcLevels(this.delta);
        this.state = levels.state;
        this.above = levels.above;

        this.ref.detectChanges();
        this.loaded = true;
        this.firstLoaded = true;
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

    // private doJigger() {
    //     let update = this.updateGauge.bind(this);
    //     Observable
    //         .timer(0, 5000)
    //         .subscribe(() => {
    //             this.loaded = false;
    //             this.ref.detectChanges();
    //             setTimeout(() => {
    //                 this.loaded = true;
    //                 update(this.fakeData());
    //                 this.ref.detectChanges();
    //             }, 250);
    //         });
    // }

    // private fakeData() {
    //     let timestamp = Date.now() - Math.round(1000 * 900 * Math.random());
    //     let value = this.normalDistance + normalDist(200);

    //     return {
    //         payload: { value, timestamp }
    //     };
    // }

}
