import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Jsonp} from "angular2/http";

import {BaseComponent} from "./../base";
import DataFilter from "../data-filter";
import DataService from "../data-service";
import PlotBands from "../plotbands";

const messages = {
    VERY_LOW: "OK",
    LOW: "[depth]cm above bottom of bridge",
    CLOSE: "[depth]cm above encroaching front lawn",
    HIGH: "[depth]cm above gravel",
    VERY_HIGH: "[depth]cm above front door",
    EXTREME: "[depth]cm above entrance floor well"
};

export class Chacks extends BaseComponent {
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
            min: -25,
            very_low: -25,
            low: -10,
            close: 0,
            high: 60,
            very_high: 80,
            extreme: 90,
            max: 110
        };
    }

    public getLocalConfig() {
        let levels = this.getLevels();
        let {min, max} = levels;
        return {
            normalDistance: 90,
            title: "Trouble at t'Mill",
            yAxis: {
                max,
                min
            },
            messages,
            levels
        };
    };
}
