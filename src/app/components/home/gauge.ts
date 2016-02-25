export default class Gauge {

    constructor(private height: number, private deltaFunc: any) {
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
                height: this.height
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
                min: -10,
                max: 40,

                // minorTickInterval: 'auto',
                // minorTickWidth: 1,
                // minorTickLength: 10,
                // minorTickPosition: 'inside',
                minorTickColor: '#bbbbbb00',

                tickPixelInterval: 30,
                tickWidth: 2,
                tickPosition: 'inside',
                tickLength: 11,
                tickColor: '#aaaaaa00',
                tickInterval: 5,
                labels: {
                    step: 1
                    // rotation: 'auto'
                },
                title: {
                    text: 'Estimated<br>Height',
                    y: 20
                },
                plotBands: null
            },
            series: [{
                name: 'Depth',
                data: [-10],
                dataLabels: {
                    enabled: true,
                    formatter: function() {
                        return Math.floor(self.deltaFunc()) + " cm";
                    }
                },
                tooltip: {
                    pointFormatter: <any>null
                }
            }],
            tooltip: {
                enabled: false
            }
        };
    }
}
