export default class TimeSeries {
    public getDefinition() {
        return {
            chart: {
                type: 'area',
                height: document.body.clientWidth < 800 ? 80 : 150
            },
            credits: {
                enabled: false
            },
            title: "",
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
