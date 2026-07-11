import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ImportDialogComponent } from '../../abstract/import-dialog.component';
import { StudentsService } from '../../../services/students.service';
import { DomainsService } from '../../../services/domains.service';
import { ImportResult } from '../../../lib/types';

@Component({
  selector: 'app-student-import-dialog',
  templateUrl: './student-import-dialog.component.html',
  styleUrls: ['./student-import-dialog.component.scss'],
  standalone: false
})
export class StudentImportDialogComponent extends ImportDialogComponent {

  private readonly studentsService = inject(StudentsService);
  private readonly domainsService = inject(DomainsService);

  domains$ = this.domainsService.findAll();

  studentForm = new FormGroup({
    specializationId: new FormControl(null, [Validators.required]),
  });

  protected override specification$ = this.studentsService.getImportSpecification();

  protected override async uploadFile(file: File): Promise<ImportResult<any, any>> {
    const specializationId = this.studentForm.value.specializationId!;
    return firstValueFrom(this.studentsService.import(file, specializationId));
  }

}
