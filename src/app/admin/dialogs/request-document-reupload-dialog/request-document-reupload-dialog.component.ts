import { Component, Inject } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { formatDate } from '../../../lib/utils';
import { AdminService } from '../../../services/admin.service';
import { firstValueFrom } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { RequiredDocument } from '../../../lib/types';

@Component({
  selector: 'app-request-document-reupload-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatButtonModule,
    MatMenuModule,
    LoadingComponent,
  ],
  templateUrl: './request-document-reupload-dialog.component.html',
  styleUrl: './request-document-reupload-dialog.component.scss'
})
export class RequestDocumentReuploadDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data: RequestDocumentReuploadDialogData,
    private readonly dialogRef: MatDialogRef<RequestDocumentReuploadDialogComponent>,
    private readonly snackBar: MatSnackBar,
    private readonly adminService: AdminService,
  ) {
    this.requiredDocuments = data.requiredDocuments;
    const documentsFormGroup = new FormGroup(
      this.requiredDocuments.reduce((acc, document) => {
        acc[document.name] = new FormGroup({
          documentName: new FormControl(document.name),
          reuploadRequested: new FormControl(data.checkedDocuments?.[document.name]),
          comment: new FormControl('', [Validators.maxLength(255)]),
        });
        return acc;
      }, {} as Record<string, DocumentFormGroupType>)
    );
    this.requestReuploadForm = new FormGroup({
      documents: documentsFormGroup,
      deadline: new FormControl(formatDate(new Date()), [Validators.required]),
    }, atLeastOneDocumentValidator);
  }

  requiredDocuments!: RequiredDocument[];
  isSubmitting = false;

  requestReuploadForm: FormGroup<{
    documents: FormGroup<Record<string, DocumentFormGroupType>>;
    deadline: FormControl<string>;
  }>;

  readonly commentTemplates = [
    {
      label: 'Date actualizate. Resemnare document',
      value: 'Unele date au fost introduse greșit, acestea fiind actualizate de secretariat. Semnați noul document generat.',
    },
    {
      label: 'Document ilizibil',
      value: 'Documentul încărcat este ilizibil. Reîncărcați documentul în format clar.',
    },
    {
      label: 'Document lipsă',
      value: 'Documentul nu a fost încărcat. Încărcați documentul solicitat.',
    },
    {
      label: 'Document greșit',
      value: 'Documentul încărcat este greșit. Reîncărcați documentul corect.',
    },
    {
      label: 'Document incomplet',
      value: 'Documentul încărcat este incomplet. Reîncărcați documentul complet.',
    },
  ];

  async sendRequest() {
    this.isSubmitting = true;
    const formValue = this.requestReuploadForm.getRawValue();
    const paperId = this.data.paperId;
    const requests = Object.values(formValue.documents)
      .filter(document => document.reuploadRequested)
      .map(document => ({
        documentName: document.documentName,
        deadline: formValue.deadline,
        comment: document.comment,
        paperId,
      }));
    const results = await firstValueFrom(this.adminService.requestDocumentsReupload(paperId, requests));
    if(results.length > 0) {
      this.snackBar.open('Solicitarea de reîncărcare a documentelor a fost transmisă.');
      this.dialogRef.close(results);
    } else {
      this.isSubmitting = false;
    }
  }

}

const atLeastOneDocumentValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const documents = control.get('documents') as FormGroup<Record<string, DocumentFormGroupType>>;
  if(!Object.values(documents.controls).some(document => document.get('reuploadRequested').value)) {
    return { atLeastOneDocument: true };
  }
  return null;
};

export interface RequestDocumentReuploadDialogData {
  paperId: number;
  requiredDocuments: RequiredDocument[];
  checkedDocuments?: Record<string, boolean>;
}

type DocumentFormGroupType = FormGroup<{
  documentName: FormControl<string>;
  reuploadRequested: FormControl<boolean>;
  comment: FormControl<string>;
}>;
