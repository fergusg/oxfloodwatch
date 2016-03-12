import {Observable} from "rxjs/Observable";
import {Injectable} from "angular2/core";
import {Jsonp} from "angular2/http";

let url= "/api/timeseries?callback=JSONP_CALLBACK";
if (location.hostname === 'localhost') {
    // url = "http://oxfloodwatch.appspot.com" + url;
    url = "//localhost:8080" + url;
}

@Injectable()
export default class DataService {
    private dataObservable: Observable<any>;
    constructor(private jsonp: Jsonp) {
        this.dataObservable = Observable
            .timer(1000, 30000)
            .switchMap((x: number, ix: number): Observable<any> => {
                console.log("Fetching", url);
                return this.jsonp.request(url)
                    .timeout(15000, new Error("Timed out"))
                    .delay(250)
                    .map((res: any) => res.json());
            });
    }

    get data(): Observable<any> {
        return this.dataObservable;
    }
}
