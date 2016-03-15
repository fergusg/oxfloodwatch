import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";
import {defaultConfig} from "../../../config";

@Component({
    selector: "about",
    templateUrl: "./about.html",
    moduleId: module.id,
    directives: [...ROUTER_DIRECTIVES]
})
class About {
    public feedback = defaultConfig.feedback;
}

export {About};
