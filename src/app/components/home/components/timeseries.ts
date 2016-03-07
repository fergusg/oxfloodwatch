import {Component, ElementRef, OnInit, OnChanges, SimpleChange} from "angular2/core";
import {Observable} from "rxjs/Observable";
import DataFilter, {FilterState} from "../tools/data-filter";

declare var $: any;
declare var _: any;

@Component({
    selector: "timeseries",
    template: `<div>
    <div class="state">{{getFilterState()}}</div>
    <div class="chart"></div>
    </div>`,
    styles: [`
        .state {
            color: darkgray;
            position: absolute;
            right: 0;
            top: -10px;
            z-index: 1000;
            font-size: 11px;
        }
    `],
    moduleId: module.id,
    inputs: ["data", "plotbands", "normalDistance"],
    providers: [DataFilter]
})
export default class TimeSeriesComponent implements OnInit, OnChanges {

    private chart: any;
    private chartElem: any;
    private plotbands: any;
    private filterState: FilterState = FilterState.FULL;
    private data: any;
    private zooming = false;
    private normalDistance;

    constructor(private elem: ElementRef, private filter: DataFilter) { }

    public ngOnInit() {
        let zones = this.plotbands.map(v => { return { color: v.color, value: v.to }; });

        this.chartElem = $(this.elem.nativeElement).find(".chart");
        let def = this.getDefinition();
        def = Object.assign({}, def, {
            series: [{ zones, data: [] }]
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
        if (!(changes["data"] && changes["data"].currentValue)) {
            return;
        }

        this.data = changes["data"].currentValue;
        this.redraw();
    }

    public getFilterState(): any {
        switch(this.filterState) {
            case FilterState.FULL:
                return "";
            case FilterState.NONE:
                return "Raw";
            case FilterState.PARTIAL:
                return "Raw, no invalid data";
            case FilterState.NORMAL:
                return "Adjusted, with spikes";
            default:
                return this.filterState;
        }
    }

    public redraw() {
        let data: any = this.filter.filter(this.data, this.normalDistance, this.filterState);

        data.sort((a, b) => a[0] - b[0]);

        let type = this.chart.series[0].type;
        if (this.filterState === FilterState.NONE || this.filterState === FilterState.PARTIAL) {
           if (type !== "line") {
                this.chart.series[0].update({ type: "line", zones: false }, true);
           }
        } else {
            if (type !== "area") {
                let zones = this.plotbands.map(v => { return { color: v.color, value: v.to }; });
                this.chart.series[0].update({ type: "area", zones }, true);
            }
        }
        this.chart.series[0].setData(data, false, true);
        // this.chart.yAxis[0].setExtremes(null, null, false, false);
        setTimeout(this.resizeChart.bind(this), 0);
    }

    public resizeChart() {
        let height = document.body.clientWidth < 800 ? 80 : 150;
        let width = $(this.elem.nativeElement).parent().innerWidth();
        this.chart.setSize(width - 25, height);
        this.chart.redraw(true);
    }

    // http://www.highcharts.com/studies/drilldown.htm
    public onSelect(event: any) {
        if (!event.xAxis) {
            return;
        }
        this.zooming = true;
        let data: any = this.filter.filter(this.data, this.filterState);

        let {min, max} = event.xAxis[0];
        let [minX, maxX] = [min, max];

        data = data.filter((v: number[]) => v[0] >= minX && v[0] <= maxX);

        let maxY = _.max(data, (v: number[]) => v[1])[1];
        let minY = _.min(data, (v: number[]) => v[1])[1];

        this.chart.xAxis[0].setExtremes(minX, maxX, false, false);
        this.chart.yAxis[0].setExtremes(minY, maxY, false, false);
        this.chart.redraw();

        return false;
    }

    public getDefinition() {
        let self = this;
        return {
            chart: {
                type: 'area',
                height: document.body.clientWidth < 800 ? 80 : 150,
                zoomType: 'x',
                panning: true,
                panKey: 'ctrl',
                events: {
                    selection: self.onSelect.bind(self)
                }

            },
            credits: {
                enabled: false
            },
            title: "My Chart",
            subtitle: false,
            xAxis: {
                type: 'datetime'
            },
            legend: {
                enabled: false
            },
            yAxis: {
                title: false,
                labels: {
                    enabled: false
                }
            },
            tooltip: {
                headerFormat: "",
                pointFormatter: function() {
                    let d = new Date(this.x);
                    var t = ("0" + d.getHours()).slice(-2) +
                        ":" + ("0" + d.getMinutes()).slice(-2);

                    return `<em>${t} <em><b>${this.y}cm</b>`;
                },
                positioner: function(labelWidth, labelHeight, point) {
                    return { x: 0, y: 0 };
                },
                crosshairs: true
            },
            plotOptions: {
                area: {
                    marker: {
                        enabled: true,
                        symbol: 'circle',
                        radius: 2,
                        fillColor: "#e68a00",
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    }
                }
            },
            series: [{
                name: 'Levels',
                data: []
            }]
        };
    }
}
