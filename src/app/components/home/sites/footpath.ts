import {Injector} from "angular2/core";

import {BaseComponent} from "./../base";

const messages = {
    VERY_LOW: "So low, even the camels are nervous.",
    LOW: "If the river were a bit higher, you might get wet feet.",
    CLOSE: "It's a close call. You probably can get around the edge with care.",
    HIGH: "Looks like you might get damp.",
    VERY_HIGH: "Pretty damned deep. Wellies only",
    EXTREME: "Call Jacques Cousteau"
};

export class Footpath extends BaseComponent {
    constructor(
        injector: Injector
    ) {
        super(injector);
    }

    public static getRouteAliases(): string[] {
        return ["/pigeonslock", "/sites/pigeonslock", "/path"];
    }

    protected getTitle() {
        return "Kirtlington to Tackley Footpath";
    }

    protected getSubTitle() {
        return "Is it flooded near Pigeons Lock?";
    }

    protected getName(): string {
        return "default";
    }

    protected getMessages() {
        return messages;
    }

}
