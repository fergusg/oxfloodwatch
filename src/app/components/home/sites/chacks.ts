import {Injector} from "angular2/core";

import {BaseComponent} from "./../base";

const messages = {
    VERY_LOW: "OK",
    LOW: "[depth]cm above top of bridge",
    CLOSE: "[depth]cm above river wall",
    HIGH: "[depth]cm above gravel",
    VERY_HIGH: "[depth]cm above front door",
    EXTREME: "[depth]cm above hallway"
};

export class Chacks extends BaseComponent {
    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    protected getLevels() {
        return {
            min: -25,
            very_low: -25,
            low: -10,
            close: 0,
            high: 50,
            very_high: 70,
            extreme: 80,
            max: 100
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
