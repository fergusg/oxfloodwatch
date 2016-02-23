import {Component, ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";
import {Observable} from "rxjs/Observable";

import Gauge from "./gauge";
import {LoaderAnim, MomentPipe} from "../../util";
import Config from "../../../config";

declare var $: any;

@Component({
    selector: "home",
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html",
    pipes: [MomentPipe],
    directives: [LoaderAnim],
    providers: [Config]
})
export class HomeCmp {
    public States = {
        VERY_LOW: false,
        LOW: false,
        CLOSE: false,
        HIGH: false,
        VERY_HIGH: false,
        EXTREME: false
    };
    public delta = 0;
    public data: any;
    public loadError = false;
    public loaded = false;

    private firstLoaded = false;
    private when: any;
    private chart: any;
    private debug = false;
    private jigger = false;
    private timeout = false;

    private GAUGE_MIN = -10;
    private GAUGE_MAX = 40;

    private normalDistance = 149;

    constructor(
        private http: Http,
        private ref: ChangeDetectorRef,
        private elem: ElementRef,
        public config: Config
    ) {
        this.jigger = location.search.includes("jigger");
        this.debug = location.search.includes("debug");
        this.timeout  = location.search.includes("timeout");
    }

    public ngOnInit() {
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
        this.http
            .get(this.config.url)
            .timeout(timeout, new Error("Timed out"))
            .delay(250)
            .map((res: any) => res.json())
            .subscribe(this.update.bind(this), onError.bind(this));
        function onError(err) {
            this.loadError = true;
            this.when = null;
            this.ref.detectChanges();
            console.error(err);
        }
    }

    private update(data: any) {
        this.resetStates();

        this.data = data;
        this.when = data.payload.timestamp;

        // Measured DOWN
        const distance = parseInt(data.payload.value, 10);

        this.delta = this.normalDistance - distance;

        let d = this.delta;
        if (d >= this.config.levels.EXTREME) {
            this.States.EXTREME = true;
        } else if (d >= this.config.levels.VERY_HIGH) {
            this.States.VERY_HIGH = true;
        } else if (d >= this.config.levels.HIGH) {
            this.States.HIGH = true;
        } else if (d >= this.config.levels.CLOSE) {
            this.States.CLOSE = true;
        } else if (d >= this.config.levels.LOW) {
            this.States.LOW = true;
        } else {
            this.States.VERY_LOW = true;
        }

        let [h] = this.limit(d);
        this.chart.series[0].points[0].update(h);
        this.ref.detectChanges();
        this.loaded = true;
        this.firstLoaded = true;
    }

    private initGauge(twitch: boolean = true) {
        var height = $(document).innerWidth() < 800 ? 240 : 400;
        var chartElem = $(this.elem.nativeElement).find(".chart");
        let def = new Gauge(height, () => this.delta).getDefinition();

        chartElem.highcharts(def);
        this.chart = chartElem.highcharts();

        // Twitch needle to +/- 1 inch
        // disable in test mode, which does it's own movement
        if (twitch) {
            let point = this.chart.series[0].points[0];
            Observable
                .timer(1000, 1000)
                .subscribe(() => {
                    let [h, limited] = this.limit(this.delta);
                    h += this.normal(limited ? 1.0 : 2.5);
                    point.update(h);
                });
        }
    };

    private limit(h: number): [number, boolean, boolean, boolean] {
        let [high, low] = [false, false];

        if (h < this.GAUGE_MIN) {
            h = this.GAUGE_MIN - 1 ;
            low = true;
        } else if (h > this.GAUGE_MAX) {
            h = this.GAUGE_MAX + 1;
            high = true;
        }
        return [h, high || low, low, high];
    }

    private normal(sigma = 1, mu = 0, n = 6) {
        var tot = 0;
        for (var i = 0; i < n; i++) {
            tot += Math.random();
        }
        return sigma * (tot - n / 2) / (n / 2) + mu;
    }
    private doJigger() {
        let update = this.update.bind(this);
        Observable
            .timer(0, 2000)
            .subscribe(() => {
                this.loaded = false;
                this.ref.detectChanges();
                // fake a 500ms load delay
                setTimeout(() => {
                    this.loaded = true;
                    update(this.fakeData());
                    this.ref.detectChanges();
                }, 500);
            });
    }

    private fakeData() {
        let timestamp = Date.now() - Math.round(1000 * 900 * Math.random());
        let value = this.normalDistance + this.normal(30);

        return {
            payload: { value, timestamp }
        };
    }

    private resetStates() {
        for (let k of Object.keys(this.States)) {
            this.States[k] = false;
        }
    }
}
