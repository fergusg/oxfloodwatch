import {Component} from "angular2/core";
import {Http} from "angular2/http";
import {Observable} from "rxjs/Observable";
import "rxjs/add/observable/timer";

declare var moment: any;

@Component({
    selector: "home",
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html"
})
export class HomeCmp {
    public title: string = "Pigeons Lock Footpath";
    public data: any;
    protected height: number;
    protected state = "OK";
    protected loaded = false;
    protected normalHeight = 185;
    protected when: any;
    private jigger = false;
    private url = "https://oxfloodnet.thingzone.uk/latest/eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3";

    constructor(private http: Http) {
        this.jigger = location.search.includes("jigger");
    }

    protected delta(): number {
        let d = this.height - this.normalHeight;
        return d;
    }

    public ngOnInit() {
        if (this.jigger) {
            Observable.timer(1000, 2000)
                .subscribe(() => { this.update(this.fakeData()); });
        } else {
            this.load();
            Observable.timer(60000, 60000)
                .subscribe(this.load.bind(this));
        }
    }

    public fakeData() {
        let timestamp = Date.now() - Math.round(1000 * 3600 * Math.random());
        let value = this.normalHeight +
            Math.floor((Math.random() - 0.5) * 10);
        return {
            payload: { value, timestamp }
        };
    }

    private load() {
        let self = this;
        this.http.get(this.url)
            .map((res: any) => res.json())
            .subscribe(
            this.update.bind(self),
            (err: any) => console.error(err)
            );
    }

    private update(data: any) {
        this.loaded = true;
        this.data = data;
        this.height = parseInt(data.payload.value, 10);
        if (this.jigger) {
            this.height = this.normalHeight +
                Math.floor((Math.random() - 0.5) * 10);
        }

        this.when = moment(data.payload.timestamp).fromNow();

        let d = this.height - this.normalHeight;
        if (d > 2) {
            this.state = "HIGH";
        } else if (d < -2) {
            this.state = "LOW";
        } else {
            this.state = "CLOSE";
        }
    }
}
