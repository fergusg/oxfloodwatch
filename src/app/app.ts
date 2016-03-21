declare var _: any;

import {Component, ViewEncapsulation} from "angular2/core";
import {RouteConfig, Redirect, Route, ROUTER_DIRECTIVES} from "angular2/router";

import {About, IndexComponent} from "./components";
import * as Sites from "./sites";


let redirectPaths: string[][] = [
    ["/about", "/About"],
    ["/help", "/About"],
    ["/contact", "/About"]
];

let redirects = _.map(redirectPaths, (r : string[]) => {
    let [path, to] = r;
    return new Redirect({ path, redirectTo: [to] });
});

let routes =     [
        new Route({ path: "/", component: IndexComponent, name: "Index", useAsDefault: true }),
        new Route({ path: "/pages/about", component: About, name: "About" }),
        ...redirects
    ];

for (let name of Object.keys(Sites)) {
    let path = `/sites/${name.toLowerCase()}`;
    let component = Sites[name];
    routes.push(new Route({path, component, name}));
    for (let path of Sites[name].getRouteAliases()) {
        routes.push(new Redirect({ path, redirectTo: [name] }));
    }
}

// Fallback
routes.push(
    new Redirect({path: '/**', redirectTo: ['/Index']})
);

@Component({
    selector: "app",
    moduleId: module.id,
    template: "<router-outlet></router-outlet>",
    encapsulation: ViewEncapsulation.None,
    directives: [ROUTER_DIRECTIVES]
})
@RouteConfig(routes)
export class AppCmp { }
