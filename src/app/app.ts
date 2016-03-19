declare var _: any;

import {Component, ViewEncapsulation} from "angular2/core";
import {RouteConfig, Redirect, Route, ROUTER_DIRECTIVES} from "angular2/router";

import {Footpath, Chacks, About, Jane, IndexComponent} from "./components";

let redirectPaths: string[][] = [
    ["/about", "/About"],
    ["/help", "/About"],
    ["/chacks", "/Chacks"],
    ["/flightsmill", "/Chacks"],
    ["/jane", "/Jane"],
    ["/pigeonslock", "/Footpath"]
];

let redirects = _.map(redirectPaths, (r) => {
    let [path, to] = r;
    return new Redirect({ path, redirectTo: [to] });
});

@Component({
    selector: "app",
    moduleId: module.id,
    template: "<router-outlet></router-outlet>",
    encapsulation: ViewEncapsulation.None,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig(
    [
        new Route({ path: "/", component: IndexComponent, name: "Index", useAsDefault: true }),
        new Route({ path: "/sites/pigeonslock", component: Footpath, name: "Footpath" }),
        new Route({ path: "/sites/chacks", component: Chacks, name: "Chacks" }),
        new Route({ path: "/sites/jane", component: Jane, name: "Jane" }),
        new Route({ path: "/pages/about", component: About, name: "About" }),
        ...redirects
    ]
)
export class AppCmp { }
