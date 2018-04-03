import { Injector } from "angular2/core";

import { BaseComponent } from "./../base";

const messages = {
    VERY_LOW: "Chill out",
    LOW: "[depth]cm above top of bridge",
    CLOSE: "[depth]cm above river wall",
    HIGH: "[depth]cm above gravel",
    VERY_HIGH: "[depth]cm above front door",
    EXTREME: "[depth]cm above hallway"
};

export class Chacks extends BaseComponent {
    constructor(injector: Injector) {
        super(injector);
    }

    public static getRouteAliases(): string[] {
        return ["/chacks", "/flightsmill"];
    }

    protected getName(): string {
        return "chacks";
    }

    protected getMessages() {
        return messages;
    }

    protected getTitle() {
        return "Trouble at t'Mill";
    }
}
