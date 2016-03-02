const feedback = "floodwatch@gooses.co.uk";
let timeSeriesUrl= "/api/timeseries?callback=JSONP_CALLBACK";
if (location.hostname === 'localhost') {
    timeSeriesUrl = "//localhost:8080" + timeSeriesUrl;
}

const yAxis = {
    minorTickColor: '#bbbbbb00',

    tickPixelInterval: 30,
    tickWidth: 2,
    tickPosition: 'inside',
    tickLength: 11,
    tickColor: '#aaaaaa00',
    tickInterval: 5,
    labels: {
        step: 1
    },
    title: {
        text: 'Estimated<br>Height',
        y: 20
    }
};

const defaultConfig = {
    feedback,
    timeSeriesUrl,
    yAxis
};

export {defaultConfig, yAxis};
