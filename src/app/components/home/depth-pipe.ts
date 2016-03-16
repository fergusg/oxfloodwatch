import {Pipe, PipeTransform} from 'angular2/core';

@Pipe({ name: 'depth' })
class DepthPipe implements PipeTransform {
    transform(value: string, args: string[]): string {
        if (!value || !args.length) {
            return '';
        }
        let depth = parseInt(args[0]);
        return value.replace("[depth]", `${depth}`);
    }
}

export {DepthPipe};
