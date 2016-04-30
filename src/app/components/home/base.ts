import {Component, OnInit, Injector} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";
import {Jsonp} from "angular2/http";

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
    public delta: number;
    public above = 0;
    public timeseries: any;
    public loadError = false;
    public loaded = true;
    public state: string;  // used in template
    public plotBands: any;
    public messages = [];
    public title = "title";
    public subtitle = "subtitle";

    private firstLoaded = false;
    private last: any;
    private debug = false;
    private jigger = false;
    private timeout = false;
    private levels: any;
    private normalDistance: number;
    private dataService: DataService;
    private dataFilter: DataFilter;
    private plotBandsService: PlotBandsService;
    private subscription: Subscription;
    private jsonp: Jsonp;

    constructor(
        injector: Injector
    ) {

        this.dataService = injector.get(DataService);
        this.dataFilter = injector.get(DataFilter);
        this.plotBandsService = injector.get(PlotBandsService);
        this.jsonp = injector.get(Jsonp);

        this.jigger = location.search.includes("jigger");
        this.debug = location.search.includes("debug");
        this.timeout = location.search.includes("timeout");

        this.title = this.getTitle();
        this.subtitle = this.getSubTitle();
    }

    public static getRouteAliases(): string[] {
        return [];
    }

    protected abstract getMessages();
    protected abstract getName(): string;
    protected abstract getTitle();
    protected getSubTitle() {
        return null;
    }

    public ngOnInit() {
        this.jsonp.request(`${defaultConfig.baseUrl}/api/config/${this.getName()}?callback=JSONP_CALLBACK`)
            .map((res: any) => res.json())
            .subscribe((data: any) => {
                this.levels = data.levels;
                this.normalDistance = data.normalDistance;
                this.plotBands = this.plotBandsService.get(this.levels);
                this.messages = this.getMessages();
                this.subscribe();
            });
    }

    private subscribe() {
        this.subscription = this.dataService.data
            .subscribe(this.update.bind(this), this.onLoadError.bind(this));
    }

    private onLoadError(err: any) {
        this.loadError = true;
        this.last = null;
        setTimeout(this.subscribe.bind(this), 30000);
        this.subscription.unsubscribe(); // Does this unsubscribe?
    }

    private update(data: any, retry = true) {
        this.timeseries = data;
        if (!_.isFinite(this.normalDistance)) {
            return;
        }

        data = this.dataFilter.filter(data, this.normalDistance);
        let [timestamp, value] = data[0];
        this.delta = parseInt(value, 10);
        this.last = timestamp;

        let {state, above} = this.calcLevels(this.delta, this.levels);

        this.state = state;
        this.above = above;

        this.loaded = true;
        this.firstLoaded = true;
    }

    private calcLevels(d, levels): any {
        if (!levels) {
            return { state: "VERY_LOW", above: null };
        }
        for (let q of ['extreme', 'very_high', 'high', 'close', 'low']) {
            let above = d - levels[q];
            console.log("xxxx calcLevels", q, levels[q], above);
            if (above > 0) {
                let state = q.toUpperCase();
                return { state, above };
            }
        }
        return { state: "VERY_LOW", above: null };
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
