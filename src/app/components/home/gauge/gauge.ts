import {Component, ElementRef, OnInit, OnChanges, SimpleChange} from "angular2/core";
import {Observable} from "rxjs/Observable";

import {normalDist, limit} from "./utils";
import chartDefintion from "./gauge-definition";

declare var $: any;
declare var _: any;

@Component({
    selector: "gauge",
    template: '',
    moduleId: module.id,
    inputs: ["range", "delta", "plotBands"]
})
export default class GaugeComponent implements OnInit, OnChanges {

    private chart: any;
    private chartElem: any;
    private delta: number;
    private range: any;
    private plotBands: any;

    constructor(private elem: ElementRef) {
        this.chartElem = $(this.elem.nativeElement);
    }

    public ngOnInit() {
        //
    }

    public getMinMax() {
        return [
            this.range ? this.range[0] : -100,
            this.range ? this.range[1] : 100
        ];
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes["delta"] && _.isFinite(changes["delta"].currentValue)) {
            let d = changes["delta"].currentValue;
            if (_.isFinite(d)) {
                this.delta = d;
            }
        }
        if (changes["range"] && changes["range"].currentValue) {
            this.range = changes["range"].currentValue;
        }
        if (changes["plotBands"] && changes["plotBands"].currentValue) {
            this.plotBands =  _.cloneDeep(changes["plotBands"].currentValue);
        }
        let ok = !!(this.delta && this.range && this.plotBands);
        if (ok) {
            let [min, max] = this.getMinMax();
            if (!this.chart) {
                let def = this.getDefinition();

                def.yAxis = Object.assign({}, def.yAxis, {
                    plotBands: this.plotBands,
                    min, max
                });

                this.chartElem.highcharts(def);
                this.chart = this.chartElem.highcharts();
                this.twitch();
            }
            const [h] = limit(this.delta, min, max);
            this.chart.series[0].points[0].update(h);
            setTimeout(this.resizeChart.bind(this), 0);
        }
    }

    public getDefinition() {
        return chartDefintion(this);
    }

    private resizeChart() {
        // let height = document.body.clientWidth < 800 ? 300 : 500;
        // let width = $(this.elem.nativeElement).parent().innerWidth();
        // let height = $(this.elem.nativeElement).parent().innerHeight();
        // this.chart.setSize(width, height);
        this.chart.redraw(false);
    }

    private twitch() {
        let point = this.chart.series[0].points[0];
        Observable
            .timer(1000, 1000)
            .subscribe(() => {
                let [min, max] = this.getMinMax();
                let [h, limited] = limit(this.delta, min, max);
                h += normalDist(limited ? 1.0 : 2.5);
                point.update(h);
            });
    }
}
