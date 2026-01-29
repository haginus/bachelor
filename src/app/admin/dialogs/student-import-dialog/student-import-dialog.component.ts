import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ImportDialogComponent } from '../../abstract/import-dialog.component';
import { StudentsService } from '../../../services/students.service';
import { DomainsService } from '../../../services/domains.service';

@Component({
  selector: 'app-student-import-dialog',
  templateUrl: './student-import-dialog.component.html',
  styleUrls: ['./student-import-dialog.component.scss']
})
export class StudentImportDialogComponent extends ImportDialogComponent {

  private readonly studentsService = inject(StudentsService);
  private readonly domainsService = inject(DomainsService);
  loading: boolean = false;

  domains = this.domainsService.findAll();

  studentForm = new FormGroup({
    'specializationId': new FormControl(null, [Validators.required]),
  });

  async handleFileInput(file: File) {
    this.loading = true;
    try {
      const specializationId = this.studentForm.value.specializationId!;
      const result = await firstValueFrom(this.studentsService.import(file, specializationId));
      this.handleImportResult(result);
    } finally {
      this.loading = false;
    }
  }

}
