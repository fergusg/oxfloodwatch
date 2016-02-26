import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";

import {HomeCmp} from "./home";

const [min, max] = [-50, 100];

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
            title: "Flights Mill",
            subtitle: "Water by weir",
            yAxis: {
                plotBands: this.getPlotBands(),
                max,
                min
            }
        };
    };



}
