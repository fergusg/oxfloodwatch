import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http, Jsonp} from "angular2/http";

import {HomeCmp} from "./home";

const [min, max] = [-10, 40];

const messages = {
    VERY_LOW: "So low, even the camels are nervous.",
    LOW: "If the river were [depth]cm higher, you might get wet feet.",
    CLOSE: "It's a close call. You probably can get around the edge with care.",
    HIGH: "Looks like you might get damp.",
    VERY_HIGH: "Pretty damned deep. Wellies only",
    EXTREME: "Call Jacques Cousteau"
};

export class Default extends HomeCmp {
    constructor(
        http: Http,
        ref: ChangeDetectorRef,
        elem: ElementRef,
        jsonp: Jsonp
    ) {
        super(http, ref, elem, jsonp);
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
            },
            messages
        };
    };

}
