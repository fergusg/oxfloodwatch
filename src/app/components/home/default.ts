import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";

import {HomeCmp} from "./home";

const [min, max] = [-10, 40];

export class Default extends HomeCmp {
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
            very_low: -10,
            low: -5,
            close: 0,
            high: 7,
            very_high: 15,
            extreme: 30,
            max
        };
    }

    public getLocalConfig() {
        return {
            normalDistance: 149,
            title: "Kirtlington to Tackley Footpath",
            subtitle: "Is it flooded near Pigeons Lock?",
            yAxis: {
                plotBands: this.getPlotBands(),
                max,
                min
            }
        };
    };

}
