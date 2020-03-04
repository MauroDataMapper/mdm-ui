import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'stringify'})
export class StringifyPipe implements PipeTransform {
    transform(value: Object, padding: number = 4) {
        if (value) {
            return JSON.stringify(value, null, padding);
        }
        return value;
    }

}