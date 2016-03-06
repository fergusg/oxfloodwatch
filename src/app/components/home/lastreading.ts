import {Component, OnInit, ChangeDetectorRef} from "angular2/core";
import {Observable} from "rxjs/Observable";

declare var moment: any;


@Component({
    selector: "lastreading",
    template: "Lasting reading was {{last}}",
    moduleId: module.id,
    inputs: ["when"]
})
export default class LastReading implements OnInit {
    private when: number;
    private last: string;

    constructor(private ref: ChangeDetectorRef) { }

    public ngOnInit() {
        Observable
            .timer(1000, 10000)
            .subscribe(this.update.bind(this));
    }

    private update() {
        this.last = moment(this.when).fromNow();
    }

}
