import {Component, ChangeDetectorRef} from "angular2/core";
import {Http} from "angular2/http";
import {Observable} from "rxjs/Observable";

declare var moment: any;

@Component({
    selector: "home",
    moduleId: module.id,
    styleUrls: ["./home.css"],
    templateUrl: "./home.html"
})
export class HomeCmp {
    public LOW = false;
    public CLOSE = false;
    public HIGH = false;
    public VERY_HIGH = false;
    public EXTREME = false;


    public title: string = "Pigeons Lock Footpath";
    public data: any;
    public delta = 0;
    protected distance: number;
    protected loaded = false;
    protected normalDistance = 152;
    protected when: any;
    private debug = false;

    private jigger = false;

    private url = "https://oxfloodnet.thingzone.uk/latest/eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3";

    constructor(private http: Http, private ref: ChangeDetectorRef) {
        this.jigger = location.search.includes("jigger");
        this.debug = location.search.includes("debug");
    }

    public ngOnInit() {
        let self = this;
        if (this.jigger) {
            let update = this.update.bind(this);
            update(this.fakeData());
            Observable.timer(0, 2000)
                .subscribe(() => {
                    self.loaded = false;
                    this.ref.detectChanges();
                    setTimeout(() => {
                        self.loaded = true;
                        update(self.fakeData());
                        this.ref.detectChanges();
                    }, 500);
                });
        } else {
            Observable.timer(0, 10000)
                .subscribe(self.load.bind(self));
        }
    }

    public fakeData() {
        let timestamp = Date.now() - Math.round(1000 * 900 * Math.random());
        let r = Math.floor((Math.random() - 0.5) * 28) - 7;
        if (Math.random() > 0.9) {
            r = -1000;
        }
        let value = this.normalDistance + r;

        return {
            payload: { value, timestamp }
        };
    }

    private load() {
        let self = this;
        self.loaded = false;
        this.ref.detectChanges();
        this.http.get(this.url)
            .delay(250)
            .map((res: any) => res.json())
            .subscribe(
            this.update.bind(self),
            (err: any) => {
                self.loaded = true;
                this.ref.detectChanges();
                console.error(err);
            }
            );
    }

    private update(data: any) {
        this.loaded = true;
        this.data = data;

        // Measured DOWN
        this.distance = parseInt(data.payload.value, 10);

        this.when = moment(data.payload.timestamp).fromNow();

        this.delta = this.normalDistance - this.distance;

        [this.CLOSE, this.HIGH, this.VERY_HIGH, this.EXTREME, this.LOW] =
            [false, false, false, false, false];

        let d = this.delta;
        if (d >= 30) {
            this.EXTREME = true;
        } else if (d >= 14) {
            this.VERY_HIGH = true;
        } else if (d >= 7) {
            this.HIGH = true;
        } else if (d > 0) {
            this.CLOSE = true;
        } else {
            this.LOW = true;
        }
        this.ref.detectChanges();
    }
}
