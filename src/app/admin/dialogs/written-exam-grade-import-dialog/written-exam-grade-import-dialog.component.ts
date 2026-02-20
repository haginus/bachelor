import { Component, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { FilesService } from '../../../services/files.service';
import { SubmissionsService } from '../../../services/submissions.service';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { UploadFileDirective } from '../../../shared/directives/upload-file.directive';
import { MatIcon } from '@angular/material/icon';
import { WrittenExamService } from '../../../services/written-exam.service';
import { ImportDialogComponent } from '../../abstract/import-dialog.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-bulk-grade-written-exam-dialog',
  imports: [
    MatDialogModule,
    MatButtonModule,
    UploadFileDirective,
    MatIcon,
    MatProgressSpinner,
],
  templateUrl: './written-exam-grade-import-dialog.component.html',
  styleUrl: './written-exam-grade-import-dialog.component.scss',
})
export class BulkGradeWrittenExamDialogComponent extends ImportDialogComponent {

  private readonly filesService = inject(FilesService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly writtenExamService = inject(WrittenExamService);
  protected isSubmitting: boolean = false;

  async downloadTemplate() {
    const file = await firstValueFrom(this.submissionsService.getExportCsv());
    this.filesService.saveFile(file, 'text/csv', 'note_proba_scrisa.csv');
  }

  async handleFileInput(file: File) {
    this.isSubmitting = true;
    try {
      const result = await firstValueFrom(this.writtenExamService.importGrades(file));
      this.handleImportResult(result);
    } finally {
      this.isSubmitting = false;
    }
  }
}
