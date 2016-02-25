import {ChangeDetectorRef, ElementRef} from "angular2/core";
import {Http} from "angular2/http";

import {HomeCmp} from "./home";

export class Default extends HomeCmp {
    constructor(
        http: Http,
        ref: ChangeDetectorRef,
        elem: ElementRef
    ) {
        super(http, ref, elem);
    }

    public getLocalConfig() {
        return {};
    }

}
