import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Jsonp} from "angular2/http";

import {BaseComponent} from "./../base";
import DataFilter from "../data-filter";
import DataService from "../data-service";
import PlotBands from "../plotbands";



const messages = {
    VERY_LOW: "So low, even the camels are nervous.",
    LOW: "If the river were [depth]cm higher, you might get wet feet.",
    CLOSE: "It's a close call. You probably can get around the edge with care.",
    HIGH: "Looks like you might get damp.",
    VERY_HIGH: "Pretty damned deep. Wellies only",
    EXTREME: "Call Jacques Cousteau"
};

export class Default extends BaseComponent {
    constructor(
        ref: ChangeDetectorRef,
        elem: ElementRef,
        jsonp: Jsonp,
        filter: DataFilter,
        dataService: DataService,
        plotBands: PlotBands
    ) {
        super(ref, elem, jsonp, filter, dataService, plotBands);
    }

    protected getLevels() {
        return {
            min : -10,
            very_low: -10,
            low: -5,
            close: 0,
            high: 7,
            very_high: 15,
            extreme: 30,
            max: 40
        };
    }

    public getLocalConfig() {
        let levels = this.getLevels();
        let {min, max} = levels;

        return {
            normalDistance: 149,
            title: "Kirtlington to Tackley Footpath",
            subtitle: "Is it flooded near Pigeons Lock?",
            yAxis: {
                max,
                min
            },
            messages
        };
    };

}
