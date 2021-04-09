import { devOnlyGuardedExpression } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Paper } from 'src/app/services/auth.service';
import { StudentExtraData, StudentService, PaperDocumentTypes, PaperRequiredDocument } from 'src/app/services/student.service';
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
  requiredDocuments: PaperRequiredDocument[] = []

  private _computeNextAction(doc: DocumentMapElement): DocumentAction {
    const isGenerated = doc.actualTypes.generated == true;
    const isSigned = doc.actualTypes.signed == true;
    const isUploaded = doc.actualTypes.copy == true;

    const needsGenerated = doc.requiredTypes.generated == true;
    const needsSigned = doc.requiredTypes.signed == true;
    const needsUploaded = doc.requiredTypes.copy == true;

    const canUpload = doc.uploadBy == 'student';

    // Only 'generated' and 'signed' can be required at once. 'copy' must be required separately

    // If file needs to be generated
    if(needsGenerated) {
      // If it is not generated then there is nothing to do
      if(!isGenerated) {
        return null;
      }
      else {
        // Else we check if it needs to be signed
        if(needsSigned) {
          // If it is signed, return 'view' action
          if(isSigned) {
            return 'view';
          } else {
            // Else check if user can upload and return the correct action
            return canUpload ? 'sign' : null;
          }
        }
        // If it does not need to be signed, then we can view it
        return 'view';
      }
    }
    // If file needs to be uploaded ('copy')
    if(needsUploaded) {
      // If it actually is uploaded, return 'view'
      if(isUploaded) {
        return 'view';
      }
      // Else check if user can upload and return the correct action
      return canUpload ? 'upload' : null;
    }
    return 'view';
  }


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
      let doc = { requiredTypes: requiredDoc.types, actualTypes, title: requiredDoc.title, lastId,
        uploadBy: requiredDoc.uploadBy, category: requiredDoc.category };
      doc['nextAction'] = this._computeNextAction(doc);
      documentMap[docName] = doc;
    });
    this.documentMap = documentMap;
  }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    let subscription = combineLatest([this.student.getPaper(), this.student.getExtraData(), this.student.getPaperRequiredDocuments()])
      .subscribe(([paper, extraData, requiredDocuments]) => {
        this.paper = paper;
        this.requiredDocuments = requiredDocuments;
        this.studentExtraData = extraData;
        this._generateDocumentMap();
        this.isLoadingInitialData = false;
        subscription.unsubscribe();
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
        let subscription = this.student.setExtraData(data).pipe(
          switchMap(result => {
            if(result) {
              return combineLatest([this.student.getPaper(), this.student.getPaperRequiredDocuments()]);
            }
            return combineLatest([of(null), of([])]);
          })
        ).subscribe( ([paper, requiredDocuments ]) => {
          if(paper) {
            this.studentExtraData = data;
            this.paper = paper;
            this.requiredDocuments = requiredDocuments;
            this._generateDocumentMap();
            subscription.unsubscribe();
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
}

interface DocumentMap {
  [name: string]: DocumentMapElement
}

interface DocumentMapElement {
  title: string,
  category: string,
  requiredTypes: PaperDocumentTypes,
  actualTypes: PaperDocumentTypes,
  lastId: number,
  actionPending?: boolean,
  nextAction?: DocumentAction,
  uploadBy: 'student' | 'teacher' | 'committee'
}

type DocumentAction = 'sign' | 'upload'  | 'view' | null;