import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({ name: 'depth' })
class DepthPipe implements PipeTransform {
    transform(value: string, args: string[]): string {
        console.log("DepthPipe", value, args);
        let depth = -1 * parseInt(args[0]);
        return value.replace("[depth]", `${depth}`);
    }
}

export {DepthPipe};
