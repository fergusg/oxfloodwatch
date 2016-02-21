import {Component, ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";
import {Observable} from "rxjs/Observable";

import MomentPipe from "./moment";
import Gauge from "./gauge";

declare var moment: any;
declare var $: any;

@Component({
    selector: "home",
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html",
    pipes: [MomentPipe]
})
export class HomeCmp {
    public VERY_LOW = false;
    public LOW = false;
    public CLOSE = false;
    public HIGH = false;
    public VERY_HIGH = false;
    public EXTREME = false;
    public delta = 0;

    private loaded = false;
    private firstLoaded = false;
    private when: any;
    private chart: any;
    private debug = false;
    private jigger = false;

    private normalDistance = 149;
    private id = "eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3";
    private url = `https://oxfloodnet.thingzone.uk/latest/${this.id}`;

    constructor(private http: Http,
        private ref: ChangeDetectorRef, private elem: ElementRef) {
        this.jigger = location.search.includes("jigger");
        this.debug = location.search.includes("debug");
    }

    public ngOnInit() {
        this.initGauge(!this.jigger);
        let self = this;
        if (this.jigger) {
            this.doJigger();
        } else {
            Observable
                .timer(0, 30000)
                .subscribe(self.load.bind(self));
        }
    }

    public fakeData() {
        let timestamp = Date.now() - Math.round(1000 * 900 * Math.random());
        let value = this.normalDistance + this.normal(30);

        return {
            payload: { value, timestamp }
        };
    }

    private doJigger() {
        let self = this;
        let update = this.update.bind(this);
        Observable
            .timer(0, 2000)
            .subscribe(() => {
                self.loaded = false;
                this.ref.detectChanges();
                // fake a 500ms load delay
                setTimeout(() => {
                    self.loaded = true;
                    update(self.fakeData());
                    this.ref.detectChanges();
                }, 500);
            });
    }

    private load() {
        let self = this;
        self.loaded = false;
        this.ref.detectChanges();
        this.http
            .get(this.url)
            .delay(250)
            .map((res: any) => res.json())
            .subscribe(this.update.bind(self), onError);
        function onError(err) {
            self.ref.detectChanges();
            console.error(err);
        }
    }

    private update(data: any) {
        this.loaded = true;
        this.firstLoaded = true;
        this.when = data.payload.timestamp;

        // Measured DOWN
        const distance = parseInt(data.payload.value, 10);
        this.delta = this.normalDistance - distance;

        [this.CLOSE, this.HIGH, this.VERY_HIGH, this.EXTREME, this.LOW, this.VERY_LOW] =
            [false, false, false, false, false, false];

        let d = this.delta;
        if (d >= 30) {
            this.EXTREME = true;
        } else if (d >= 14) {
            this.VERY_HIGH = true;
        } else if (d >= 7) {
            this.HIGH = true;
        } else if (d >= 0) {
            this.CLOSE = true;
        } else if (d <= -10) {
            this.VERY_LOW = true;
        } else {
            this.LOW = true;
        }

        this.chart.series[0].points[0].update(d);
        this.ref.detectChanges();
    }

    private initGauge(autoJigger: boolean = true) {
        var height = $(document).innerWidth() < 800 ? 240 : 400;
        var self = this;
        var chartElem = $(this.elem.nativeElement).find(".chart");
        let def = new Gauge(height, () => this.delta).getDefinition();

        chartElem.highcharts(def);
        this.chart = chartElem.highcharts();

        // Jigger needle to +/- 1 inch
        // disable in test mode, which does it's own jigger
        if (autoJigger) {
            let point = this.chart.series[0].points[0];
            Observable
                .timer(2000, 1000)
                .subscribe(() => {
                    point.update(self.delta + self.normal(2.5));
                });
        }
    };

    private normal(sigma = 1, mu = 0, n = 6) {
        var tot = 0;
        for (var i = 0; i < n; i++) {
            tot += Math.random();
        }
        return sigma * (tot - n / 2) / (n / 2) + mu;
    }
}
