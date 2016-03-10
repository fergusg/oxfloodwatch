import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Jsonp} from "angular2/http";

import {BaseComponent} from "./../base";
import DataFilter from "../data-filter";
import DataService from "../data-service";

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
        dataService: DataService
    ) {
        super(ref, elem, jsonp, filter, dataService);
    }

    protected getLevels() {
        return {
            min: -25,
            very_low: -25,
            low: -10,
            close: 0,
            high: 24,
            very_high: 30,
            extreme: 36,
            max: 50
        };
    }

    public getLocalConfig() {
        let levels = this.getLevels();
        let {min, max} = levels;
        return {
            normalDistance: 70,
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
