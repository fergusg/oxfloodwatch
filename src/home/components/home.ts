import {Component, ChangeDetectorRef} from "angular2/core";
import {Http} from "angular2/http";
import {Observable} from "rxjs/Observable";

import MomentPipe from "./moment";

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
    public LOW = false;
    public CLOSE = false;
    public HIGH = false;
    public VERY_HIGH = false;
    public EXTREME = false;

    public title: string = "Pigeons Lock Footpath";
    public data: any;
    public delta = 0;
    protected distance: number;
    protected loaded = false;
    protected firstLoaded = false;
    protected normalDistance = 149;
    protected when: any;
    private debug = false;

    private jigger = false;

    private url = "https://oxfloodnet.thingzone.uk/latest/eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3";

    constructor(private http: Http, private ref: ChangeDetectorRef) {
        this.jigger = location.search.includes("jigger");
        this.debug = location.search.includes("debug");
    }

    public ngOnInit() {
        let self = this;
        if (this.jigger) {
            let update = this.update.bind(this);
            update(this.fakeData());
            Observable.timer(0, 2000)
                .subscribe(() => {
                    self.loaded = false;
                    this.ref.detectChanges();
                    setTimeout(() => {
                        self.loaded = true;
                        update(self.fakeData());
                        this.ref.detectChanges();
                    }, 500);
                });
        } else {
            Observable.timer(0, 30000)
                .subscribe(
                    self.load.bind(self)
                );
        }
        this.initGauge();
    }

    public fakeData() {
        let timestamp = Date.now() - Math.round(1000 * 900 * Math.random());
        let r = Math.floor((Math.random() - 0.5) * 28) - 7;
        if (Math.random() > 0.9) {
            r = -1000;
        }
        let value = this.normalDistance + r;

        return {
            payload: { value, timestamp }
        };
    }



    private load() {
        let self = this;
        self.loaded = false;
        this.ref.detectChanges();
        this.http.get(this.url)
            .delay(250)
            .map((res: any) => res.json())
            .subscribe(
            this.update.bind(self),
            (err: any) => {
                this.ref.detectChanges();
                console.error(err);
            }
            );
    }

    private update(data: any) {
        this.loaded = true;
        this.firstLoaded = true;
        this.data = data;

        // Measured DOWN
        this.distance = parseInt(data.payload.value, 10);

        // this.when = moment(data.payload.timestamp).fromNow();
        this.when = data.payload.timestamp;

        this.delta = this.normalDistance - this.distance;

        [this.CLOSE, this.HIGH, this.VERY_HIGH, this.EXTREME, this.LOW] =
            [false, false, false, false, false];

        let d = this.delta;
        if (d >= 30) {
            this.EXTREME = true;
        } else if (d >= 14) {
            this.VERY_HIGH = true;
        } else if (d >= 7) {
            this.HIGH = true;
        } else if (d >= 0) {
            this.CLOSE = true;
        } else {
            this.LOW = true;
        }

        let chart = $('#container').highcharts();
        let point = chart.series[0].points[0];
        point.update(d);

        this.ref.detectChanges();
    }

    private initGauge() {

        var height = 400;

        if ($(document).innerWidth() < 800) {
            height = 240;
        }

        let self = this;
        $('#container').highcharts({

            chart: {
                type: 'gauge',
                plotBackgroundColor: null,
                plotBackgroundImage: null,
                plotBorderWidth: 0,
                plotShadow: false,
                marginTop: 0,
                spacingTop: 0,
                height: height
            },
            credits: {
                enabled: false
            },
            title: {
                text: null
            },


            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [{
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [
                            [0, '#FFF'],
                            [1, '#333']
                        ]
                    },
                    borderWidth: 0,
                    outerRadius: '109%'
                }, {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#333'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '107%'
                    }, {
                        // default background
                    }, {
                        backgroundColor: '#DDD',
                        borderWidth: 0,
                        outerRadius: '105%',
                        innerRadius: '103%'
                    }]
            },

            // the value axis
            yAxis: {
                min: -30,
                max: 60,

                minorTickInterval: 'auto',
                minorTickWidth: 1,
                minorTickLength: 10,
                minorTickPosition: 'inside',
                minorTickColor: '#666',

                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 10,
                tickColor: '#666',
                labels: {
                    step: 2,
                    rotation: 'auto'
                },
                title: {
                    text: 'Estimated<br>Height',
                    y: 30
                },
                plotBands: [{
                    from: -30,
                    to: 0,
                    color: '#55BF3B' // green
                }, {
                        from: 0,
                        to: 10,
                        color: '#DDDF0D' // yellow
                    }, {
                        from: 10,
                        to: 60,
                        color: '#DF5353' // red
                    }]
            },

            series: [{
                name: 'Depth',
                data: [-30],
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Math.floor(self.delta) + " cm";
                    }
                },
                tooltip: {
                    pointFormatter: null
                }
            }],

            tooltip: {
                enabled: false
            }

        });
        let chart = $('#container').highcharts();
        let point = chart.series[0].points[0];

        Observable.timer(2000, 500)
            .subscribe(() => {
                let r = Math.random() + Math.random() + Math.random() + Math.random();
                r = r / 4;
                point.update(this.delta + (r - 0.5) * 3);
            });

    };
}
