import { Component, computed, input } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { FixedPipe } from '../../pipes/fixed.pipe';

@Component({
  selector: 'app-submission-grade-table',
  imports: [MatTableModule, FixedPipe],
  templateUrl: './submission-grade-table.component.html',
  styleUrl: './submission-grade-table.component.scss',
})
export class SubmissionGradeTableComponent {

  paperGrade = input<number | null | undefined>(undefined);
  hasWrittenExam = input<boolean>(false);
  writtenExamFinalGrade = input<number | null | undefined>(undefined);
  displayedColumns = ['title', 'grade', 'minGrade'];

  submissionGrade = computed(() => {
    const parts: { title: string; grade: number | null | undefined; minGrade: number }[] = [];
    if(this.hasWrittenExam()) {
      parts.push({ title: 'Cunoștințe fundamentale și de specialitate', grade: this.writtenExamFinalGrade(), minGrade: 5 });
    }
    parts.push({ title: 'Prezentarea și susținerea lucrării', grade: this.paperGrade(), minGrade: 5 });
    const grades = parts.map(p => p.grade);
    const hasPendingGrades = grades.some(grade => grade === undefined);
    const isAbsent = grades.some(grade => grade === null || grade === 0);
    const average = hasPendingGrades
      ? undefined
      : isAbsent
        ? null
        : grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
    const isPromoted = isAbsent
      ? false
      : average === undefined
        ? undefined
        : average >= 6 && parts.every(p => p.grade !== null && p.grade >= p.minGrade);
    return {
      parts,
      average,
      isPromoted,
    };
  });


}
