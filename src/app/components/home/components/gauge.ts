import {Component, ElementRef, OnInit, OnChanges, SimpleChange} from "angular2/core";
import {Observable} from "rxjs/Observable";

import {normalDist} from "./utils";

declare var $: any;

@Component({
    selector: "gauge",
    template: '',
    moduleId: module.id,
    inputs: ["config", "delta"]
})
export default class GaugeComponent implements OnInit, OnChanges {

    private chart: any;
    private chartElem: any;
    private delta: number;
    private config: any;

    constructor(private elem: ElementRef) { }

    public ngOnInit() {
        this.chartElem = $(this.elem.nativeElement);
        let def = this.getDefinition();

        def.yAxis = Object.assign({}, def.yAxis, this.config.yAxis);

        this.chartElem.highcharts(def);
        this.chart = this.chartElem.highcharts();
        this.twitch();
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes["delta"] && changes["delta"].currentValue) {
            this.delta = changes["delta"].currentValue;
            const [h] = this.limit(this.delta, this.config.levels.min, this.config.levels.max);
            this.chart.series[0].points[0].update(h);
            setTimeout(this.resizeChart.bind(this), 0);
        }
    }

    public getDefinition() {
        const self = this;
        return {
            chart: {
                type: 'gauge',
                plotBackgroundColor: <string>null,
                plotBackgroundImage: <string>null,
                plotBorderWidth: 0,
                plotShadow: false,
                marginTop: 0,
                spacingTop: 0,
                height: document.body.clientWidth < 800 ? 240 : 400
            },
            credits: {
                enabled: false
            },
            title: {
                text: <string>null
            },
            pane: {
                startAngle: -150,
                endAngle: 150,
                background: [
                    {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#FFF'],
                                [1, '#333']
                            ]
                        },
                        borderWidth: 0,
                        outerRadius: '109%'
                    },
                    {
                        backgroundColor: {
                            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                            stops: [
                                [0, '#333'],
                                [1, '#FFF']
                            ]
                        },
                        borderWidth: 1,
                        outerRadius: '107%'
                    },
                    {
                        // default background
                    },
                    {
                        backgroundColor: '#DDD',
                        borderWidth: 0,
                        outerRadius: '105%',
                        innerRadius: '103%'
                    }
                ]
            },

            yAxis: {
                minorTickColor: '#bbbbbb00',

                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 11,
                tickColor: '#aaaaaa00',
                tickInterval: 5,
                labels: {
                    step: 1
                },
                title: {
                    text: 'Estimated<br>Height',
                    y: 20
                }
            },
            series: [{
                name: 'Depth',
                data: [-1000],
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Math.floor(self.delta) + " cm";
                    }
                }
            }],
            tooltip: {
                enabled: false
            }
        };
    }

    private resizeChart() {
        let height = document.body.clientWidth < 800 ? 240 : 400;
        let width = $(this.elem.nativeElement).parent().innerWidth();
        this.chart.setSize(width, height);
        this.chart.redraw(false);
    }

    private twitch() {
        let point = this.chart.series[0].points[0];
        Observable
            .timer(1000, 1000)
            .subscribe(() => {
                let [h, limited] = this.limit(this.delta, this.config.levels.min, this.config.levels.max);
                h += normalDist(limited ? 1.0 : 2.5);
                point.update(h);
            });
    }

    private limit(h: number, min: number, max: number): [number, boolean, boolean, boolean] {
        let [high, low] = [false, false];

        if (h < min) {
            h = min - 1;
            low = true;
        } else if (h > max) {
            h = max + 1;
            high = true;
        }
        return [h, high || low, low, high];
    }

}
