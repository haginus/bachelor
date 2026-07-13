import { Component, inject } from '@angular/core';
import { FilesService } from '../../../services/files.service';
import { SubmissionsService } from '../../../services/submissions.service';
import { MatButtonModule } from '@angular/material/button';
import { firstValueFrom } from 'rxjs';
import { MatIcon } from '@angular/material/icon';
import { WrittenExamService } from '../../../services/written-exam.service';
import { ImportDialogComponent } from '../../abstract/import-dialog.component';
import { ImportDialogContentComponent } from '../../../shared/components/import-dialog-content/import-dialog-content.component';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';

@Component({
  selector: 'app-bulk-grade-written-exam-dialog',
  imports: [
    MatButtonModule,
    MatIcon,
    ImportDialogContentComponent,
    LoadingComponent,
],
  templateUrl: './written-exam-grade-import-dialog.component.html',
  styleUrl: './written-exam-grade-import-dialog.component.scss',
})
export class BulkGradeWrittenExamDialogComponent extends ImportDialogComponent {

  private readonly filesService = inject(FilesService);
  private readonly submissionsService = inject(SubmissionsService);
  private readonly writtenExamService = inject(WrittenExamService);

  protected override specification$ = this.writtenExamService.getImportGradesSpecification();

  protected override uploadFile(file: File) {
    return this.writtenExamService.importGrades(file);
  }

  async downloadTemplate() {
    const file = await firstValueFrom(this.submissionsService.getExportCsv());
    this.filesService.saveFile(file);
  }

}
