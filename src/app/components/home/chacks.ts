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
        return {
            normalDistance: 80,
            title: "Trouble at t'Mill",
            subtitle: null,
            yAxis: {
                plotBands: this.getPlotBands(),
                max,
                min
            },
            messages
        };
    };
}
