import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";

@Component({
    selector: "index",
    moduleId: module.id,
    templateUrl: "./index.html",
    directives: [...ROUTER_DIRECTIVES]
})
export class IndexComponent  {
}
