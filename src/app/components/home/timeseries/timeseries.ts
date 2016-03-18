import {Component, ElementRef, OnInit, OnChanges, SimpleChange} from "angular2/core";
import {Observable} from "rxjs/Observable";
import DataFilter, {FilterState} from "../data-filter";
import chartDefinition from "./timeseries-definition";

declare var $: any;
declare var _: any;

@Component({
    selector: "timeseries",
    templateUrl: "./timeseries.html",
    styleUrls: ['./timeseries.css'],
    moduleId: module.id,
    inputs: ["data", "plotBands", "normalDistance"],
    providers: [DataFilter]
})
export default class TimeSeriesComponent implements OnInit, OnChanges {

    private chart: any;
    private chartElem: any;
    private plotBands: any;
    private filterState: FilterState = FilterState.FULL;
    private data: any[] = [];
    private zooming = false;
    private normalDistance = 0;

    constructor(private elem: ElementRef, private dataFilter: DataFilter) { }

    public ngOnInit() {
        this.chartElem = $(this.elem.nativeElement).find(".chart");
        let def = chartDefinition(this);
        def = Object.assign({}, def, {
            series: [{ data: [] }]
        });

        this.chartElem.highcharts(def);
        this.chart = this.chartElem.highcharts();
        Observable
            .fromEvent(this.elem.nativeElement, "dblclick")
            .subscribe(() => {
                if (this.zooming) {
                    this.zooming = false;
                    this.chart.xAxis[0].setExtremes(null, null, false, false);
                    this.chart.yAxis[0].setExtremes(null, null, false, false);
                } else {
                    this.filterState = (this.filterState + 1) % 4;
                }
                this.redraw();
            });
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes["data"] && changes["data"].currentValue) {
            this.data = changes["data"].currentValue;
        }
        if (changes["normalDistance"] && changes["normalDistance"].currentValue) {
            this.normalDistance = changes["normalDistance"].currentValue;
        }
        if (changes["plotbands"] && _.isArray(changes["plotbands"].currentValue)) {
            this.plotBands = _.cloneDeep(changes["plotbands"].currentValue);
            let zones = this.plotBands.map(v => { return { color: v.color, value: v.to }; });
            this.chart.series[0].update({ zones });
        }
        this.redraw();
    }

    public getFilterState(): any {
        switch (this.filterState) {
            case FilterState.FULL:
                return "";
            case FilterState.NONE:
                return "Raw (all)";
            case FilterState.PARTIAL:
                return "Raw";
            case FilterState.NORMAL:
                return "Adjusted";
            default:
                return this.filterState;
        }
    }

    public redraw() {
        if (!this.chart) {
            return;
        }
        if (!_.isFinite(this.normalDistance)) {
            return;
        }

        let data: any = this.dataFilter.filter(this.data, this.normalDistance, this.filterState);

        data.sort((a, b) => a[0] - b[0]);

        if (this.filterState === FilterState.NONE || this.filterState === FilterState.PARTIAL) {
            this.chart.series[0].update({ type: "line", zones: false }, true);
            this.chart.yAxis[0].setExtremes(null, null, false, false);
        } else if (this.plotBands) {
            let zones = this.plotBands.map(v => { return { color: v.color, value: v.to }; });

            this.chart.series[0].update({ type: "area", zones }, true);
        }
        this.chart.series[0].setData(data, false, true);
        setTimeout(this.resizeChart.bind(this), 0);
    }

    public resizeChart() {
        // let height = document.body.clientWidth < 800 ? 80 : 150;
        // let width = $(this.elem.nativeElement).parent().innerWidth();
        // this.chart.setSize(width - 25, height);
        this.chart.redraw(true);
    }
}
