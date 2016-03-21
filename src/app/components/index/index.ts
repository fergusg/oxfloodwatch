import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";
import * as Sites from "../home/sites/index";

declare var _: any;

@Component({
    selector: "index",
    moduleId: module.id,
    templateUrl: "./index.html",
    directives: [...ROUTER_DIRECTIVES]
})
export class IndexComponent  {
    public sites: any = [];
    constructor() {
        for (let name of Object.keys(Sites)) {
            this.sites.push(name);
        }
    }
}
