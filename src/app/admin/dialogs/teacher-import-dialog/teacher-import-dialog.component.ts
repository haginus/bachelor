import { Component, inject } from '@angular/core';
import { ImportDialogComponent } from '../../abstract/import-dialog.component';
import { TeachersService } from '../../../services/teachers.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-teacher-import-dialog',
  templateUrl: './teacher-import-dialog.component.html',
  styleUrls: ['./teacher-import-dialog.component.scss']
})
export class TeacherImportDialogComponent extends ImportDialogComponent {

  private readonly teachersService = inject(TeachersService);

  loading: boolean = false;

  ngOnInit(): void { }

  async handleFileInput(file: File) {
    this.loading = true;
    try {
      const result = await firstValueFrom(this.teachersService.import(file));
      this.handleImportResult(result);
    } finally {
      this.loading = false;
    }
  }

}
