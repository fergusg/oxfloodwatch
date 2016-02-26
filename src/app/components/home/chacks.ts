import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";

import {HomeCmp} from "./home";

const [min, max] = [-20, 50];

const messages = {
    VERY_LOW: "OK",
    LOW: "[depth]cm above bottom of bridge",
    CLOSE: "[depth]cm above encroaching front lawn",
    HIGH: "[depth]cm above gravel",
    VERY_HIGH: "[depth]cm above front door",
    EXTREME: "[depth]cm above entrance floor well"
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
            very_high: 30,
            extreme: 36,
            max
        };
    }

    public getLocalConfig() {
        return {
            normalDistance: 80,
            title: "Trouble at t'Mill",
            yAxis: {
                plotBands: this.getPlotBands(),
                max,
                min
            },
            messages
        };
    };
}
