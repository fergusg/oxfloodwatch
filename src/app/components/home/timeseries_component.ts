import {Component, ElementRef, OnInit, OnChanges, SimpleChange} from "angular2/core";
import {Observable} from "rxjs/Observable";
import Filter, {FilterState} from "./filter";

declare var $: any;
declare var _: any;

@Component({
    selector: "timeseries",
    template: '',
    moduleId: module.id,
    inputs: ["data", "plotbands"],
    providers: [Filter]
})
export default class TimeSeriesComponent implements OnInit, OnChanges {

    private chart: any;
    private chartElem: any;
    private plotbands: any;
    private doFilter: FilterState = FilterState.FULL;
    private data: any;
    private zooming = false;

    constructor(private elem: ElementRef, private filter: Filter) { }

    public ngOnInit() {
        let zones = this.plotbands.map(v => { return { color: v.color, value: v.to }; });

        this.chartElem = $(this.elem.nativeElement);
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
                    this.doFilter = (this.doFilter + 1) % 3;
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

    public redraw() {
        let data: any = this.filter.filter(this.data, this.doFilter);

        this.chart.series[0].setData(data, false, false);
        // this.chart.yAxis[0].setExtremes(null, null, false, false);
        setTimeout(this.resizeChart.bind(this), 0);
    }

    public resizeChart() {
        let height = document.body.clientWidth < 800 ? 80 : 150;
        let width = $(this.elem.nativeElement).parent().innerWidth();
        this.chart.setSize(width - 25, height);
        this.chart.redraw(false);
    }

    // http://www.highcharts.com/studies/drilldown.htm
    public onSelect(event: any) {

        if (event.xAxis) {
            this.zooming = true;
            let data: any = this.filter.filter(this.data, this.doFilter);

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
//                    return { x: point.plotX - labelWidth, y: 0 };
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
