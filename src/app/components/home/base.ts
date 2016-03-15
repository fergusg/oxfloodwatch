import {Component, OnInit, Injector} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";

import {Subscription} from "rxjs/Subscription";

import TimeSeriesComponent from "./timeseries/timeseries";
import GaugeComponent from "./gauge/gauge";
import LastReading from "./lastreading";

import {LoaderAnim, MomentPipe} from "../../util";
import {DepthPipe} from "./depth-pipe";
import {defaultConfig} from "../../../config";
import DataFilter from "./data-filter";
import DataService from "./data-service";
import PlotBandsService from "./plotbands-service";

declare var $: any;
declare var _: any;

@Component({
    selector: "home",
    providers: [DataFilter, DataService, PlotBandsService],
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html",
    pipes: [MomentPipe, DepthPipe],
    directives: [...ROUTER_DIRECTIVES, LoaderAnim, TimeSeriesComponent, GaugeComponent, LastReading]
})
export abstract class BaseComponent implements OnInit {
    public delta = 0;
    public above = 0;
    public timeseries: any;
    public loadError = false;
    public loaded = false;
    public state: string;  // used in template
    public plotBands: any;

    private config: any;
    private firstLoaded = false;
    private when: any;
    private debug = false;
    private jigger = false;
    private timeout = false;
    private levels: any;
    private normalDistance: number;
    private dataService: DataService;
    private dataFilter: DataFilter;
    private plotBandsService: PlotBandsService;
    private subscription: Subscription;

    constructor(
        injector: Injector
    ) {

        this.dataService = injector.get(DataService);
        this.dataFilter = injector.get(DataFilter);
        this.plotBandsService = injector.get(PlotBandsService);

        this.jigger = location.search.includes("jigger");
        this.debug = location.search.includes("debug");
        this.timeout = location.search.includes("timeout");

        this.levels = this.getLevels();
        this.plotBands = this.plotBandsService.get(this.levels);
        this.config = this.getConfig();

        this.normalDistance = this.config.normalDistance;
    }

    public abstract getLocalConfig();
    protected abstract getLevels();

    public ngOnInit() {
        this.subscribe();
    }

    private getConfig() {
        let c = Object.assign(
            {
                levels: this.levels,
                feedback: defaultConfig.feedback
            },
            this.getLocalConfig()
        );
        c.yAxis.plotBands = _.cloneDeep(this.plotBands);
        return c;
    }

    private subscribe() {
        this.subscription = this.dataService.data
            .subscribe(this.update.bind(this), this.onLoadError.bind(this));
    }

    private onLoadError(err: any) {
        this.loadError = true;
        this.when = null;
        setTimeout(this.subscribe.bind(this), 30000);
        this.subscription.unsubscribe(); // Does this unsubscribe?
    }

    private update(data: any, retry = true) {
        this.timeseries = data;

        data = this.dataFilter.filter(data, this.normalDistance);
        let [timestamp, value] = data[0];
        this.delta = parseInt(value, 10);
        this.when = timestamp;

        let {state, above} = this.calcLevels(this.delta, this.levels);
        this.state = state;
        this.above = above;

        this.loaded = true;
        this.firstLoaded = true;
    }

    private calcLevels(d, levels) {
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
