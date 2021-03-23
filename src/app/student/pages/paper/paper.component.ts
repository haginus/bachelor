import { devOnlyGuardedExpression } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Paper } from 'src/app/services/auth.service';
import { StudentExtraData, StudentService } from 'src/app/services/student.service';
import { DocumentUploadDialogComponent } from '../../dialogs/document-upload-dialog/document-upload-dialog.component';
import { StudentExtraDataEditorComponent } from '../../dialogs/student-extra-data-editor/student-extra-data-editor.component';

@Component({
  selector: 'app-student-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class StudentPaperComponent implements OnInit {

  constructor(private dialog: MatDialog, private student: StudentService, private snackbar: MatSnackBar) { }

  paper: Paper = null;
  studentExtraData: StudentExtraData = null;
  isLoadingInitialData: boolean = true;
  isWaitingForDocumentGeneration = false;

  documentMap: DocumentMap = {}

  private _generateDocumentMap() {
    const documents = this.paper.documents;
    let documentMap = { }
    this.requiredDocuments.forEach(requiredDoc => {
      const docName = requiredDoc.name;
      const currentDocuments = documents.filter(document => document.name == docName);
      let actualTypes = {}
      currentDocuments.forEach(doc => {
        actualTypes[doc.type] = true;
      })
      let lastId = currentDocuments.length == 0 ? null : currentDocuments.map(doc => doc.id).reduce((max, id) => (max < id) ? id : max);
      let doc = { requiredTypes: requiredDoc.types, actualTypes, title: requiredDoc.title, lastId };
      documentMap[docName] = doc;
    });
    this.documentMap = documentMap;
  }

  ngOnInit(): void {

    combineLatest([this.student.getPaper(), this.student.getExtraData()]).subscribe(([paper, extraData]) => {
      this.paper = paper;
      this.studentExtraData = extraData;
      this._generateDocumentMap();
      this.isLoadingInitialData = false;
    });
  }

  editStudentExtraData() {
    const dialogRef = this.dialog.open(StudentExtraDataEditorComponent, {
      data: this.studentExtraData,
      width: '100%'
    });

    dialogRef.afterClosed().subscribe(data => {
      if(data) {
        this.isWaitingForDocumentGeneration = true;
        this.student.setExtraData(data).pipe(
          switchMap(result => {
            if(result)
              return this.student.getPaper();
            return of(null);
          })
        ).subscribe(paper => {
          if(paper) {
            this.studentExtraData = data;
            this.paper = paper;
            this._generateDocumentMap();
          }
          this.isWaitingForDocumentGeneration = false;
        })
      }
    })
  }

  viewDocument(mapElement: DocumentMapElement) {
    mapElement.actionPending = true;
    let snackbarRef = this.snackbar.open("Se descarcă documentul...", null, {
      duration: 100000
    });

    const id = mapElement.lastId;
    const type = this.paper.documents.find(doc => doc.id == id).mimeType;
    this.student.getDocument(id).subscribe(data => {
      mapElement.actionPending = false;
      if(!data) {
        this.snackbar.open("A apărut o eroare.");
        return;
      }
      snackbarRef.dismiss();
      const blob = new Blob([data], { type });
      const url = window.URL.createObjectURL(blob);
      window.open(url);
    })
  }

  openDocumentDialog(action: 'sign' | 'uploadCopy', documentName: string, documentId?: number) {
    const document = this.requiredDocuments.find(doc => doc.name == documentName);
    let dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      data: {
        action,
        document,
        documentId
      },
      width: '100%',
      maxWidth: '500px'
    });
    dialogRef.afterClosed().pipe(
      switchMap(res => {
        this.documentMap[documentName].actionPending = true;
        if(res) {
          return this.student.getPaper();
        }
        return of(null);
      })
    ).subscribe(paper => {
      this.documentMap[documentName].actionPending = false;
      if(paper) {
        this.paper = paper;
        this._generateDocumentMap();
      }
    })
  }



  requiredDocuments: RequiredDocument[] = [
    {
      title: "Cerere de înscriere",
      name: "sign_up_form",
      types: {
        generated: true,
        signed: true
      },
      acceptedMimeTypes: 'application/pdf',
      acceptedExtensions: ['pdf']
    },
    {
      title: "Declarație pe proprie răspundere",
      name: "statutory_declaration",
      types: {
        generated: true,
        signed: true
      },
      acceptedMimeTypes: 'application/pdf',
      acceptedExtensions: ['pdf']
    },
    {
      title: "Formular de lichidare",
      name: "liquidation_form",
      types: {
        generated: true,
        signed: true
      },
      acceptedMimeTypes: 'application/pdf',
      acceptedExtensions: ['pdf']
    },
    {
      title: "Copie C.I.",
      name: "identity_card",
      types: {
        copy: true
      },
      acceptedMimeTypes: 'application/pdf,image/png,image/jpeg',
      acceptedExtensions: ['pdf', 'png', 'jpeg']

    }
  ]
}

export interface RequiredDocument {
  title: string,
  name: string,
  types: DocumentTypes,
  acceptedMimeTypes: string,
  acceptedExtensions: string[]
}

interface DocumentMap {
  [name: string]: DocumentMapElement
}

interface DocumentMapElement {
  title: string,
  requiredTypes: DocumentTypes,
  actualTypes: DocumentTypes,
  lastId: number,
  actionPending: boolean
}

interface DocumentTypes {
  generated?: boolean,
  signed?: boolean,
  copy?: boolean
}
