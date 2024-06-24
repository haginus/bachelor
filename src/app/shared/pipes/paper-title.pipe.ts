import { Pipe, PipeTransform } from "@angular/core";
import { Paper } from "../../services/auth.service";

@Pipe({ name: 'paperTitle', standalone: true })
export class PaperTitlePipe implements PipeTransform {
  transform (paper: Paper): string {
    let result = '';
    if(paper.student) {
      result += `${paper.student.lastName} ${paper.student.firstName}, `;
    }
    result += paper.title;
    return result;
  }
}
