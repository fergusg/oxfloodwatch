import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";

import {HomeCmp} from "./home";

const [min, max] = [-50, 100];

const messages = {
    VERY_LOW: "At top step.",
    LOW: "At bottom of bridge",
    CLOSE: "Encroaching front lawn",
    HIGH: "At gravel",
    VERY_HIGH: "At front door",
    EXTREME: "Top of entrance floor well"
};

const plotBands = [
    {
        from: -1000,
        to: -25,
        color: '#55BF3B' // green
    },
    {
        from: -25,
        to: 0,
        color: '#00e600' // green
    },
    {
        from: 0,
        to: 20,
        color: '#DDDF0D' // yellow
    },
    {
        from: 20,
        to: 40,
        color: '#ffa366' // orange
    },
    {
        from: 40,
        to: 60,
        color: '#ff6600' // orange
    },
    {
        from: 60,
        to: 1000,
        color: '#cc0000' // red
    }
];

const yAxis = {
    plotBands,
    max,
    min
};

const config = {
    levels: {
        EXTREME: 30,
        VERY_HIGH: 14,
        HIGH: 7,
        CLOSE: 0,
        LOW: -10
    },

    GAUGE_MIN: min,
    GAUGE_MAX: max,

    normalDistance: 80,

    title: "Trouble at t'Mill",
    subtitle: null,
    yAxis,
    messages
};

export class Chacks extends HomeCmp {
    constructor(
        http: Http,
        ref: ChangeDetectorRef,
        elem: ElementRef
    ) {
        super(http, ref, elem);
    }

    protected getLevels() {
        return {
            min,
            very_low: -25,
            low: -10,
            close: 0,
            high: 20,
            very_high: 40,
            extreme: 60,
            max
        };
    }

    public getLocalConfig() {
        return config;
    };
}
