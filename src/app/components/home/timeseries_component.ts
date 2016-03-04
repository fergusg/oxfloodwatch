import {Component, ElementRef, OnInit, OnChanges, SimpleChange} from "angular2/core";

declare var $: any;

@Component({
    selector: "timeseries",
    template: '',
    moduleId: module.id,
    inputs: ["data", "plotbands"]
})
export default class TimeSeriesComponent implements OnInit, OnChanges {

    private chart: any;
    private chartElem: any;
    private plotbands: any;

    constructor(private elem: ElementRef) { }

    public ngOnInit() {
        let zones = this.plotbands.map(v => { return { color: v.color, value: v.to }; });

        this.chartElem = $(this.elem.nativeElement);
        let def = this.getDefinition();
        def = Object.assign({}, def, {
            series: [{ zones, data: [] }]
        });

        this.chartElem.highcharts(def);
        this.chart = this.chartElem.highcharts();
    }

    public ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (!(changes["data"] && changes["data"].currentValue)) {
            return;
        }

        let data = changes["data"].currentValue;
        let min = +Infinity;
        let max = -Infinity;
        for (let [_, value] of data) {
            max = Math.max(max, value);
            min = Math.min(min, value);
            _ = !!_; // hack to fool linters which don't like unused vars
        }

        // when min/max are super close, expand them
        if (Math.abs(max-min) < 5) {
            max = max + 5;
            min = min - 5;
        }

        this.chart.series[0].setData(data, false, false);
        // this.chart.yAxis[0].setExtremes(min, max, false, false);
        setTimeout(this.resizeChart.bind(this), 0);
    }

    public resizeChart() {
        let height = document.body.clientWidth < 800 ? 80 : 150;
        let width = $(this.elem.nativeElement).parent().innerWidth();
        this.chart.setSize(width - 25, height);
        this.chart.redraw(false);
    }

    public getDefinition() {
        return {
            chart: {
                type: 'area',
                height: document.body.clientWidth < 800 ? 80 : 150
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
                pointFormat: '{point.y}cm',
                positioner: function(labelWidth, labelHeight, point) {
                    return { x: point.plotX - labelWidth, y: 0 };
                },
                crosshairs: true
            },
            plotOptions: {
                area: {
                    marker: {
                        enabled: false,
                        symbol: 'circle',
                        radius: 2,
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
