declare var _: any;
declare var $: any;

function smallScreen() {
    return document.body.clientWidth < 768;
}

// http://www.highcharts.com/studies/drilldown.htm
function onSelect(event: any) {
    if (!event.xAxis) {
        return;
    }
    this.zooming = true;

    let {min, max} = event.xAxis[0];

    let data = _.filter(this.chart.series[0].data, (p: any) => p.x >= min && p.x <= max);
    let ydata = _.map(data, (v: any) => v.y);
    let minY = _.min(ydata);
    let maxY = _.max(ydata);

    this.chart.xAxis[0].setExtremes(min, max);
    this.chart.yAxis[0].setExtremes(minY, maxY);

    return false;
}

function getDefinition(self) {
    return {
        chart: {
            type: 'area',
            zoomType: 'x',
            panning: true,
            panKey: 'ctrl',
            events: {
                selection: onSelect.bind(self)
            }
            // width: $(self.elem.nativeElement).parent().innerWidth(),
            // height: $(self.elem.nativeElement).parent().innerHeight()

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
                    enabled: !smallScreen(),
                    symbol: 'circle',
                    radius: 1.2,
                    fillColor: "#989898",
                    states: {
                        hover: {
                            enabled: true,
                            radius: 4
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
