const feedback = "floodwatch@gooses.co.uk";
let url: string;
let jsonp: boolean = true;
if (location.hostname === 'localhost') {
    url = "//localhost:8080/api/latest?callback=JSONP_CALLBACK";
} else {
    // const id = `eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3`;
    // url = `https://oxfloodnet.thingzone.uk/latest/${id}`;
    // jsonp = false;
    url = "/api/latest?callback=JSONP_CALLBACK";
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
    url,
    jsonp,
    yAxis
};

export {defaultConfig, yAxis};
