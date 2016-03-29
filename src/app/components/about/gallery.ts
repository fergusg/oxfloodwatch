import {Component} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";

declare var $: any;

@Component({
    selector: "gallery",
    templateUrl: "./gallery.html",
    moduleId: module.id,
    directives: [...ROUTER_DIRECTIVES]
})
class Gallery {
    public images = [
        {
          src: "dry.jpg",
          descr: "Normal"
        },
        {
          src: "wet.jpg",
          descr: "Wet"
        }
    ];

    ngOnInit() {
        $('.carousel').carousel({
            interval: 4000
        });
    }
}

export {Gallery};
