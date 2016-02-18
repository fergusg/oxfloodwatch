import {Component, ViewEncapsulation} from "angular2/core";
import {
RouteConfig,
ROUTER_DIRECTIVES
} from "angular2/router";

import {HomeCmp} from "../../home/components/home";

@Component({
    selector: "app",
    moduleId: module.id,
    templateUrl: "./app.html",
    encapsulation: ViewEncapsulation.None,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig([
    { path: "/", component: HomeCmp, name: "Home" },
])
export class AppCmp { }
