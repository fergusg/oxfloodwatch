import {Component} from "angular2/core";
import {Http} from "angular2/http";

declare var moment: any;

@Component({
    selector: "home",
    moduleId: module.id,
    styles: [
        `
            .glyphicon-thumbs-up {
                color: green;
            }
            .glyphicon-thumbs-down {
                color: red;
            }
            .glyphicon {
                font-size: 320px;
                margin-top: 30px;
                margin-left: 100px;
                margin-right: 100px;
            }
            @media(min-width: 768px) {
              .glyphicon {
                  margin-left: 120px;
              }
            }
        `
    ],
    templateUrl: "./home.html"
})
export class HomeCmp {
    public title: string = "Pigeons Lock Footpath";
    public data: any;
    protected height: number;
    protected ok = false;
    protected loaded = false;
    protected normalHeight = 185;
    protected when: any;
    private url = "https://oxfloodnet.thingzone.uk/latest/eykx-cjw5-u2i3-fesc-53d4-nvg6.o.3";

    constructor(private http: Http) {
        this.http.get(this.url)
            .map((res: any) => res.json())
            .subscribe(
            (data: any) => {
                this.loaded = true;
                console.log(data);
                this.data = data;
                this.height = parseInt(data.payload.value, 10);

                this.when = moment(data.payload.timestamp).fromNow();
                this.ok = this.height < this.normalHeight;
            },
            (err: any) => console.error(err)
            );
    }

    protected delta(): number {
        return this.height - this.normalHeight;
    }

}
