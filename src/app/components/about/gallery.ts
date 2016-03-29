import {Component, ElementRef} from "angular2/core";
import {ROUTER_DIRECTIVES} from "angular2/router";

declare var $: any;
declare var _: any;

@Component({
    selector: "gallery",
    templateUrl: "./gallery.html",
    moduleId: module.id,
    directives: [...ROUTER_DIRECTIVES],
    styles: [
        `
            .carousel {
                margin-bottom: 10px;
                margin-top: 10px;
            }
        `
    ]
})
class Gallery {
    public images: any[];
    public id: string;

    constructor(private elem: ElementRef) {
        this.id = "gallery-" + Math.random().toString(36).slice(2);
        this.images = _.map(
            [
                ["dry", "Normal"],
                ["wet", "Wet"]
            ],
            (d => { return { src: `${d[0]}.jpg`, descr: d[1] }; })
        );
    }

    ngOnInit() {
        $(this.elem.nativeElement).find(".carousel").carousel({
            interval: 4000
        });
    }
}

export {Gallery};
