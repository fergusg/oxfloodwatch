import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";

import {Default} from "./default";
import {defaultConfig} from "../../../config";

const [min, max] = [-50, 100];

export class Chacks extends Default {
    constructor(
        http: Http,
        ref: ChangeDetectorRef,
        elem: ElementRef
    ) {
        super(http, ref, elem);
    }

    public getPlotBands() {
        let levels = this.getLevels();
        return [
            {
                from: -1000,
                to: levels.low,
                color: '#55BF3B' // green
            },
            {
                from: levels.low,
                to: levels.close,
                color: '#00e600' // green
            },
            {
                from: levels.close,
                to: levels.high,
                color: '#DDDF0D' // yellow
            },
            {
                from: levels.high,
                to: levels.very_high,
                color: '#ffa366' // orange
            },
            {
                from: levels.very_high,
                to: levels.extreme,
                color: '#ff6600' // orange
            },
            {
                from: levels.extreme,
                to: 1000,
                color: '#cc0000' // red
            }
        ];
    }

    public getConfig() {
        return Object.assign({}, defaultConfig, this.getLocalConfig());
    }

    public getLocalConfig() {
        return {
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
            yAxis: {
                plotBands: this.getPlotBands(),
                max,
                min
            }
        };
    };

    private getLevels() {
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


}
