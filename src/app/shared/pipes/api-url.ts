import { Pipe, PipeTransform } from "@angular/core";
import { environment } from "../../../environments/environment";

@Pipe({ name: 'apiUrl', standalone: true })
export class ApiUrlPipe implements PipeTransform {
  transform(value: string): string {
    return environment.apiUrl + value;
  }
}
