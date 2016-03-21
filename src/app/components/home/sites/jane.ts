import {Injector} from "angular2/core";

import {BaseComponent} from "./../base";

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
        injector: Injector
    ) {
        super(injector);
    }

    public static getRouteAliases(): string[] {
        return ["/jane"];
    }

    protected getName(): string {
        return "jane";
    }

    protected getTitle() {
        return "Vyv and Jane's Fields";
    }

    protected getSubTitle() {
        return "Is it flooded near Pigeons Lock?";
    }

    protected getMessages() {
        return messages;
    }

}
