import { Component, DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentUploadDialogComponent, DocumentUploadDialogData } from '../document-upload-dialog/document-upload-dialog.component';
import { DocumentService } from '../../services/document.service';
import { PaperDocument, SessionSettings } from '../../services/auth.service';
import { USER_TYPES } from '../../lib/constants';
import { PaperDocumentCategory, PaperDocumentTypes, PaperDocumentUploadBy } from '../../services/student.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-paper-document-list',
  templateUrl: './paper-document-list.component.html',
  styleUrls: ['./paper-document-list.component.scss'],
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatMenuModule,
  ]
})
export class PaperDocumentListComponent implements OnChanges {

  constructor(
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private document: DocumentService
  ) { }

  @Input() requiredDocuments: PaperRequiredDocument[] = [];
  @Input() documents: PaperDocument[] = [];
  /** In what quality is the viewer of this list */
  @Input() perspective: 'student' | 'teacher' | 'committee' | 'admin' = 'student';
  /** Paper ID (needed for teacher / committee to know where to upload the document) */
  @Input() paperId: number;
  /** Whether the user can upload/remove documents. */
  @Input() canEdit: boolean = true;
  /** Session Settings needed to determine whether the user can upload certain docs. */
  @Input() sessionSettings: SessionSettings;
  /**  Emit events when documents change (signed / copy uploaded) */
  @Output() documentEvents = new EventEmitter<PaperDocumentEvent>();
  /**  Output variable that tells whether all the documents are uploaded (by uploader and category) */
  @Output() areDocumentsUploaded = new EventEmitter<AreDocumentsUploaded>();

  ngOnChanges(changes: SimpleChanges): void {
    this._generateDocumentMap();
  }

  USER_TYPES = USER_TYPES;

  documentMap: DocumentMap = {}

  /** Function to check if a we are in the submission period for a certain category. */
  private _checkSubmissionDates(category: PaperDocumentCategory): boolean {
    if(!this.sessionSettings) {
      return true;
    }
    if(category == 'secretary_files') {
      return this.sessionSettings.canUploadSecretaryFiles();
    } else if(category == 'paper_files') {
      return this.sessionSettings.canUploadPaperFiles();
    } else {
      return true;
    }
  }

  private _computeNextAction(doc: DocumentMapElement): DocumentAction {
    const isGenerated = doc.actualTypes.generated == true;
    const isSigned = doc.actualTypes.signed == true;
    const isUploaded = doc.actualTypes.copy == true;

    const needsGenerated = doc.requiredTypes.generated == true;
    const needsSigned = doc.requiredTypes.signed == true;
    const needsUploaded = doc.requiredTypes.copy == true;

    const canUpload = doc.uploadBy == this.perspective && this.canEdit;

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
    const documents = this.documents;
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
        uploadBy: requiredDoc.uploadBy, category: requiredDoc.category, canChange: true };

      doc.canChange = this.canEdit && this._checkSubmissionDates(doc.category);
      doc['nextAction'] = this._computeNextAction(doc);
      documentMap[docName] = doc;
    });
    this.documentMap = documentMap;
    this._generateAreDocumentsUploaded();
  }

  private _generateAreDocumentsUploaded(): void {
    let areDocumentsUploaded: AreDocumentsUploaded = {
      byCategory: {
        secretary_files: true,
        paper_files: true
      },
      byUploader: {
        student: true,
        teacher: true,
        committee: true
      },
      byUploaderCategory: {
        student: {
          secretary_files: true,
          paper_files: true
        },
        teacher: {
          secretary_files: true,
          paper_files: true
        },
        committee: {
          secretary_files: true,
          paper_files: true
        }
      }
    }
    let docNames = Object.keys(this.documentMap);
    docNames.forEach(docName => {
      let doc = this.documentMap[docName];
      // Init by category with true
      if(areDocumentsUploaded[doc.category] != undefined) {
        areDocumentsUploaded.byCategory[doc.category] = true;
      }
      // Get required types
      let requiredTypes = Object.keys(doc.requiredTypes);
      // Get uploader
      let uploader = doc.uploadBy;
      // For each required type
      requiredTypes.forEach(type => {
        // If doc actual type lacks required type set byUploader and byCategory correspondig to the doc to false
        if(!doc.actualTypes[type]) {
          areDocumentsUploaded.byUploader[uploader] = false;
          areDocumentsUploaded.byCategory[doc.category] = false;
          areDocumentsUploaded.byUploaderCategory[uploader][doc.category] = false;
        }
      });
    });
    this.areDocumentsUploaded.emit(areDocumentsUploaded);
  }

  openDocumentDialog(action: 'sign' | 'uploadCopy', documentName: string, documentId?: number) {
    const document = this.requiredDocuments.find(doc => doc.name == documentName);
    let dialogRef = this.dialog.open<DocumentUploadDialogComponent, DocumentUploadDialogData>(DocumentUploadDialogComponent, {
      data: {
        action,
        document,
        documentId,
        paperId: this.paperId,
        perspective: this.perspective
      },
      width: '80%',
      maxWidth: '500px'
    });
    dialogRef.afterClosed().subscribe(document => {
      if(document) {
        this.documentEvents.emit({ documentName, action });
        this.documents.push(document);
        this._generateDocumentMap();
      }
    })
  }

  reuploadDocument(document: PaperRequiredDocument) {
    const mapElement = this.documentMap[document.name];
    const action = document.types['copy'] ? 'uploadCopy' : 'sign';
    this.openDocumentDialog(action, document.name, mapElement.lastId);
  }

  viewDocument(mapElement: DocumentMapElement) {
    mapElement.actionPending = true;
    let snackbarRef = this.snackbar.open("Se descarcă documentul...", null, {
      duration: null // infinite duration
    });

    const id = mapElement.lastId;
    const type = this.documents.find(doc => doc.id == id).mimeType;
    this.document.getDocument(id).subscribe(data => {
      mapElement.actionPending = false;
      if(!data) {
        this.snackbar.open("A apărut o eroare.");
        return;
      }
      snackbarRef.dismiss();
      this.document.viewDocument(data, type);
    })
  }

  deleteDocument(mapElement: DocumentMapElement) {
    let documentId = mapElement.lastId;
    mapElement.actionPending = true;
    this.document.deleteDocument(documentId).subscribe(result => {
      if(result) {
        let idx = this.documents.findIndex(doc => doc.id == documentId);
        this.documents.splice(idx, 1);
        this._generateDocumentMap();
        this.snackbar.open('Document șters.');
      }
      mapElement.actionPending = false;

    });
  }

}

interface DocumentMap {
  [name: string]: DocumentMapElement
}



interface DocumentMapElement {
  title: string,
  category: PaperDocumentCategory,
  requiredTypes: PaperDocumentTypes,
  actualTypes: PaperDocumentTypes,
  lastId: number,
  actionPending?: boolean,
  nextAction?: DocumentAction,
  uploadBy: PaperDocumentUploadBy;
  canChange: boolean;
}

type DocumentAction = 'sign' | 'upload'  | 'view' | null;

export interface PaperRequiredDocument {
  title: string,
  name: string,
  category: PaperDocumentCategory,
  types: PaperDocumentTypes,
  acceptedMimeTypes: string,
  acceptedExtensions: string[],
  uploadBy: PaperDocumentUploadBy;
}

export interface PaperDocumentEvent {
  documentName: string,
  action: 'sign' | 'uploadCopy'
}

export interface AreDocumentsUploaded {
  byCategory: {
    [name in PaperDocumentCategory]: boolean
  };
  byUploader: {
    [name in PaperDocumentUploadBy]: boolean
  },
  byUploaderCategory: {
    [name in PaperDocumentUploadBy]: {
      [name in PaperDocumentCategory]: boolean
    }
  }
}
