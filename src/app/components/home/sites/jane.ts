import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Jsonp} from "angular2/http";

import {BaseComponent} from "./../base";
import DataFilter from "../data-filter";
import DataService from "../data-service";


const [min, max] = [-10, 40];

const messages = {
    VERY_LOW: "So low, even the camels are nervous.",
    LOW: "If the river were [depth]cm higher, you might get wet feet.",
    CLOSE: "It's a close call. You probably can get around the edge with care.",
    HIGH: "Looks like you might get damp.",
    VERY_HIGH: "Pretty damned deep. Wellies only",
    EXTREME: "Call Jacques Cousteau"
};

export class Jane extends BaseComponent {
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
            title: "Vyv and Jane's Fields",
            subtitle: "Is it flooded near Pigeons Lock?",
            yAxis: {
                max,
                min
            },
            messages
        };
    };

}
