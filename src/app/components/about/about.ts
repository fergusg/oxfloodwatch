import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";

@Component({
    selector: "about",
    templateUrl: "./about.html",
    moduleId: module.id,
    directives: [...ROUTER_DIRECTIVES]
})
class About {
}

export {About};
