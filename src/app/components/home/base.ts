import {Component, ChangeDetectorRef, ElementRef, OnInit} from "angular2/core";
import {JSONP_PROVIDERS, Jsonp} from "angular2/http";

import TimeSeriesComponent from "./timeseries/timeseries";
import GaugeComponent from "./gauge/gauge";
import LastReading from "./lastreading";

import {LoaderAnim, MomentPipe} from "../../util";
import {DepthPipe} from "./depth-pipe";
import {defaultConfig} from "../../../config";
import DataFilter from "./data-filter";
import DataService from "./data-service";

declare var $: any;
declare var _: any;

@Component({
    selector: "home",
    providers: [JSONP_PROVIDERS, DataFilter, DataService],
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html",
    pipes: [MomentPipe, DepthPipe],
    directives: [LoaderAnim, TimeSeriesComponent, GaugeComponent, LastReading]
})
export abstract class BaseComponent implements OnInit {
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
        private jsonp: Jsonp,
        private dataFilter: DataFilter,
        private dataService: DataService
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

    public ngOnInit() {
        this.dataService.data
            .subscribe(this.update.bind(this), this.onLoadError.bind(this));
    }

    private onLoadError(err: any) {
        this.loadError = true;
        this.when = null;
        this.ref.detectChanges();
        console.error(err);
    }

    private update(data: any, retry = true) {
        this.timeseries = data;

        data = this.dataFilter.filter(data, this.normalDistance);
        let [timestamp, value] = data[0];
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
