declare var _: any;
// http://www.highcharts.com/studies/drilldown.htm
function onSelect(event: any) {
    console.log("onSelect");

    if (!event.xAxis) {
        return;
    }
    this.zooming = true;
    let data: any = this.filter.filter(this.data, this.filterState);

    let {min, max} = event.xAxis[0];
    let [minX, maxX] = [min, max];

    data = data.filter((v: number[]) => v[0] >= minX && v[0] <= maxX);

    this.chart.xAxis[0].setExtremes(minX, maxX, false, false);
    this.chart.redraw();

    return false;
}


function getDefinition(self) {

    return {
        chart: {
            type: 'area',
            height: document.body.clientWidth < 800 ? 80 : 150,
            zoomType: 'x',
            panning: true,
            panKey: 'ctrl',
            events: {
                selection: onSelect.bind(self)
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

export default getDefinition;
