import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({ name: 'depth' })
class DepthPipe implements PipeTransform {
    transform(value: string, args: string[]): string {
        console.log("DepthPipe", value, args);
        return value.replace("[depth]", args[0]);
    }
}

export {DepthPipe};
