import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: 'join', standalone: true })
export class JoinPipe implements PipeTransform {
  transform (input: any[], separator: string = ', '): string {
    return input.join(separator);
  }
}
