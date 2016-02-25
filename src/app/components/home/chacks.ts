import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";

import {HomeCmp} from "./home";
import {defaultConfig} from "../../../config";

const [min, max]  = [-50, 100];

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

    title: "Flights Mill",
    subtitle: "Water by weir",
    yAxis
};

export class Chacks extends HomeCmp {
    constructor(
        http: Http,
        ref: ChangeDetectorRef,
        elem: ElementRef
    ) {
        super(http, ref, elem);
    }

    public getConfig() {
        return Object.assign(defaultConfig, config);
    }


}
