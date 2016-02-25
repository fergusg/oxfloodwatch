const feedback = "floodwatch@gooses.co.uk";
const id = `eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3`;
const url = `https://oxfloodnet.thingzone.uk/latest/${id}`;


const messages = {
    VERY_LOW: "So low, even the camels are nervous.",
    LOW: "If the river were [depth]cm higher, you might get wet feet.",
    CLOSE: "It's a close call. You probably can get around the edge with care.",
    HIGH: "Looks like you might get damp.",
    VERY_HIGH: "Pretty damned deep. Wellies only",
    EXTREME: "Call Jacques Cousteau"
};

const plotBands = [
    {
        from: -10,
        to: -5,
        color: '#55BF3B' // green55BF3B
    },
    {
        from: -5,
        to: 0,
        color: '#00e600' // green
    },
    {
        from: 0,
        to: 7,
        color: '#DDDF0D' // yellow
    },
    {
        from: 7,
        to: 15,
        color: '#ffa366' // orange
    },
    {
        from: 15,
        to: 30,
        color: '#ff6600' // orange
    },
    {
        from: 30,
        to: 1000,
        color: '#cc0000' // red
    }
];


const yAxis = {
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
    plotBands
};

const defaultConfig = {
    levels: {
        EXTREME: 30,
        VERY_HIGH: 14,
        HIGH: 7,
        CLOSE: 0,
        LOW: -10
    },

    GAUGE_MIN: -10,
    GAUGE_MAX: 40,

    normalDistance: 149,

    title: "Kirtlington to Tackley Footpath",
    subtitle: "Is it flooded near Pigeons Lock?",
    feedback,
    url,
    messages,
    yAxis
};

export {defaultConfig, yAxis};
