import {Component, ViewEncapsulation} from "angular2/core";
import {
RouteConfig,
ROUTER_DIRECTIVES
} from "angular2/router";

import {Default, Chacks} from "./components";

@Component({
    selector: "app",
    moduleId: module.id,
    templateUrl: "./app.html",
    encapsulation: ViewEncapsulation.None,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: "/", component: Default, name: "Home" },
    { path: "/chacks", component: Chacks, name: "Chacks" },
])
export class AppCmp { }
