export default class TimeSeries {

    constructor(private height: number, private deltaFunc: any) {
    }

    public getDefinition() {
        return {
            chart: {
                type: 'area',
                height: this.height
            },
            credits: {
                enabled: false
            },
            title: "xxxxxx",
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
                    enabled : false
                }
            },
            tooltip: {
                headerFormat: "",
                pointFormat: '{point.y}cm',
                positioner: function( labelWidth, labelHeight, point) {
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
