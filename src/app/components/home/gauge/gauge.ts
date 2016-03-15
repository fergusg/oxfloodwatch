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
    inputs: ["levels", "delta", "plotBands"]
})
export default class GaugeComponent implements OnInit, OnChanges {

    private chart: any;
    private chartElem: any;
    private delta: number;
    private levels: any;
    private plotBands: any;

    constructor(private elem: ElementRef) { }

    public ngOnInit() {
        this.chartElem = $(this.elem.nativeElement);
        this.plotBands =  _.cloneDeep(this.plotBands);
        let def = this.getDefinition();

        def.yAxis = Object.assign({}, def.yAxis, {
            plotBands: this.plotBands,
            min: this.levels.min,
            max: this.levels.max
        });

        this.chartElem.highcharts(def);
        this.chart = this.chartElem.highcharts();
        this.twitch();
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes["delta"] && changes["delta"].currentValue) {
            this.delta = changes["delta"].currentValue;
            const [h] = limit(this.delta, this.levels.min, this.levels.max);
            this.chart.series[0].points[0].update(h);
            setTimeout(this.resizeChart.bind(this), 0);
        }
    }

    public getDefinition() {
        return chartDefintion(this);
    }

    private resizeChart() {
        let height = document.body.clientWidth < 800 ? 300 : 500;
        let width = $(this.elem.nativeElement).parent().innerWidth();
        this.chart.setSize(width, height);
        this.chart.redraw(false);
    }

    private twitch() {
        let point = this.chart.series[0].points[0];
        Observable
            .timer(1000, 1000)
            .subscribe(() => {
                let [h, limited] = limit(this.delta, this.levels.min, this.levels.max);
                h += normalDist(limited ? 1.0 : 2.5);
                point.update(h);
            });
    }
}
