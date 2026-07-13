import { Component, inject } from '@angular/core';
import { ImportDialogComponent } from '../../abstract/import-dialog.component';
import { Observable, of } from 'rxjs';
import { ImportSpecification, ImportResult } from '../../../lib/types';
import { CommitteesService } from '../../../services/committees.service';

@Component({
  selector: 'app-paper-auto-assign-dialog',
  templateUrl: './paper-auto-assign-dialog.component.html',
  styleUrl: './paper-auto-assign-dialog.component.scss',
  standalone: false,
})
export class PaperAutoAssignDialogComponent extends ImportDialogComponent {

  private readonly committeesService = inject(CommitteesService);

  protected override specification$: Observable<ImportSpecification> = of({
    type: null,
    mimeType: null,
    properties: [
      { name: 'Titlu lucrare', entityPropertyPath: 'title', propertyPath: 'title' },
      { name: 'Student', entityPropertyPath: 'student.fullName', propertyPath: 'student.fullName' },
      { name: 'Profesor', entityPropertyPath: 'teacher.fullName', propertyPath: 'teacher.fullName' },
      { name: 'Comisie', entityPropertyPath: 'committee.name', propertyPath: 'committee.name' },
    ],
  });

  protected override uploadFile() {
    return this.committeesService.autoAssignPapers();
  }

}
