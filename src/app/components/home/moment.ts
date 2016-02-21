import {Pipe, PipeTransform} from 'angular2/core';

declare var moment: any;

@Pipe({ name: 'moment' })
export default class MomentPipe implements PipeTransform {
    transform(value: string, args: string[]): string {
        return moment(value).fromNow();
    }
}
