const feedback = "floodwatch@gooses.co.uk";
const id = `eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3`;
const url = `https://oxfloodnet.thingzone.uk/latest/${id}`;

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
    yAxis
};

export {defaultConfig, yAxis};
