declare var $: any;

function getDefinition(self) {
    return {
        chart: {
            type: "gauge",
            plotBackgroundColor: <string>null,
            plotBackgroundImage: <string>null,
            plotBorderWidth: 0,
            plotShadow: false,
            marginTop: 0,
            spacingTop: 0
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
                        stops: [[0, "#FFF"], [1, "#333"]]
                    },
                    borderWidth: 0,
                    outerRadius: "109%"
                },
                {
                    backgroundColor: {
                        linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                        stops: [[0, "#333"], [1, "#FFF"]]
                    },
                    borderWidth: 1,
                    outerRadius: "107%"
                },
                {
                    backgroundColor: "#DDD",
                    borderWidth: 0,
                    outerRadius: "105%",
                    innerRadius: "103%"
                }
            ]
        },

        yAxis: {
            minorTickColor: "#bbbbbb88",

            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: "inside",
            tickLength: 11,
            tickColor: "#aaaaaa88",
            tickInterval: 10,
            labels: {
                step: 1
            },
            title: {
                text: "Estimated<br>Height",
                y: 20
            }
        },
        series: [
            {
                name: "Depth",
                data: [-1000],
                dataLabels: {
                    y: 60,
                    backgroundColor: "white",
                    enabled: true,
                    formatter: function() {
                        return Math.floor(self.delta) + " cm";
                    }
                }
            }
        ],
        tooltip: {
            enabled: false
        }
    };
}
export default getDefinition;
