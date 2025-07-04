import { Component, DoCheck, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentUploadDialogComponent, DocumentUploadDialogData } from '../document-upload-dialog/document-upload-dialog.component';
import { DocumentService } from '../../../services/document.service';
import { PaperDocument, SessionSettings } from '../../../services/auth.service';
import { USER_TYPES } from '../../../lib/constants';
import { PaperDocumentCategory, PaperDocumentTypes, PaperDocumentUploadBy } from '../../../services/student.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { DocumentReuploadRequest } from '../../../lib/types';
import { inclusiveDate } from '../../../lib/utils';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { DocumentUploadHistoryDialogComponent, DocumentUploadHistoryDialogData } from '../document-upload-history-dialog/document-upload-history-dialog.component';

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
    MatTooltipModule,
    DatePipe,
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
  @Input() documentReuploadRequests: DocumentReuploadRequest[] = [];
  /** In what quality is the viewer of this list */
  @Input() perspective: 'student' | 'teacher' | 'committee' | 'admin' = 'student';
  /** Paper ID (needed for teacher / committee to know where to upload the document) */
  @Input() paperId: number;
  /** The user expected to sign the documents */
  @Input() signUserId: number;
  /** Whether the user can upload/remove documents. */
  @Input() canEdit: boolean = true;
  /** Session Settings needed to determine whether the user can upload certain docs. */
  @Input() sessionSettings: SessionSettings;
  /** Suffix for all document names. Useful when viewing multiple papers in the same view. */
  @Input() documentNameSuffix?: string;
  /**  Emit events when documents change (signed / copy uploaded) */
  @Output() documentEvents = new EventEmitter<PaperDocumentEvent>();
  /**  Output variable that tells whether all the documents are uploaded (by uploader and category) */
  @Output() areDocumentsUploaded = new EventEmitter<AreDocumentsUploaded>();
  /** Emits whether all document reupload requests are resolved. */
  @Output() reuploadRequestsResolved = new EventEmitter<boolean>();
  /** Emit when admin user asks for a document to be reuploaded. */
  @Output() reuploadRequest = new EventEmitter<{ document: DocumentMapElement; reuploadRequested: boolean; }>();

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
        if(needsUploaded) {
          // If it is signed, return 'view' action
          if(isUploaded) {
            return 'view';
          } else {
            // Else check if user can upload and return the correct action
            return canUpload ? 'upload' : null;
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

  private _isDocumentUploaded(requiredTypes: PaperDocumentTypes, actualTypes: PaperDocumentTypes): boolean {
    return Object.keys(requiredTypes).every(type => actualTypes[type]);
  }

  private _generateDocumentMap() {
    const documents = this.documents;
    let documentMap = {};
    const today = Date.now();
    this.requiredDocuments.forEach(requiredDoc => {
      const docName = requiredDoc.name;
      const currentDocuments = documents.filter(document => document.name == docName);
      const reuploadRequest = this.documentReuploadRequests.find(request => (
        request.documentName == docName && inclusiveDate(request.deadline).getTime() >= today
      ));
      let actualTypes = currentDocuments.reduce((acc, doc) => {
        acc[doc.type] = true;
        return acc;
      }, {} as PaperDocumentTypes);
      let lastId = currentDocuments.length == 0
        ? null
        : Math.max(...currentDocuments.map(doc => doc.id));
      const lastDocument = currentDocuments.find(doc => doc.id == lastId);
      const isUploaded =
        this._isDocumentUploaded(requiredDoc.types, actualTypes) &&
        (!reuploadRequest || new Date(lastDocument?.createdAt) > new Date(reuploadRequest.createdAt));
      let doc = {
        requiredDocument: requiredDoc,
        requiredTypes: requiredDoc.types,
        actualTypes,
        title: requiredDoc.title,
        lastId,
        isUploaded,
        uploadBy: requiredDoc.uploadBy,
        category: requiredDoc.category,
        reuploadRequest: !isUploaded ? reuploadRequest : null,
        canChange: this.canEdit && (this._checkSubmissionDates(requiredDoc.category) || !!reuploadRequest),
      } satisfies Partial<DocumentMapElement>;
      doc['nextAction'] = this._computeNextAction(doc);
      documentMap[docName] = doc;
    });
    this.documentMap = documentMap;
    this._generateAreDocumentsUploaded();
    this._emitReuploadRequestsResolved();
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
      // Init byCategory with true
      if(areDocumentsUploaded[doc.category] != undefined) {
        areDocumentsUploaded.byCategory[doc.category] = true;
      }
      if(!doc.isUploaded) {
        areDocumentsUploaded.byUploader[doc.uploadBy] = false;
        areDocumentsUploaded.byCategory[doc.category] = false;
        areDocumentsUploaded.byUploaderCategory[doc.uploadBy][doc.category] = false;
      }
    });
    this.areDocumentsUploaded.emit(areDocumentsUploaded);
  }

  private _emitReuploadRequestsResolved() {
    let unresolvedRequests = Object.values(this.documentMap).filter(doc => doc.reuploadRequest);
    this.reuploadRequestsResolved.emit(unresolvedRequests.length == 0);
  }

  openUploadDialog(mapElement: DocumentMapElement) {
    let dialogRef = this.dialog.open<DocumentUploadDialogComponent, DocumentUploadDialogData>(DocumentUploadDialogComponent, {
      data: {
        document: mapElement.requiredDocument,
        paperId: this.paperId,
        generatedDocumentId: mapElement.actualTypes.generated ? mapElement.lastId : undefined,
      },
      width: '80%',
      maxWidth: '500px'
    });
    dialogRef.afterClosed().subscribe(document => {
      if(document) {
        this.documentEvents.emit({ documentName: mapElement.requiredDocument.name, action: 'uploadCopy' });
        this.documents.push(document);
        this._generateDocumentMap();
      }
    })
  }

  async signDocument(mapElement: DocumentMapElement) {
    const { buffer, type, title } = await this.getDocument(mapElement);
    if(!buffer) return;
    const dialogRef = this.document.viewDocument(
      buffer,
      type,
      title,
      { requiredDocument: mapElement.requiredDocument, paperId: this.paperId, signUserId: this.signUserId }
    );
    dialogRef.componentInstance.documentSigned.subscribe(document => {
      this.documentEvents.emit({
        documentName: document.name,
        action: 'sign',
      });
      this.documents.push(document);
      this._generateDocumentMap();
    });
  }

  reuploadDocument(mapElement: DocumentMapElement) {
    if(mapElement.requiredTypes['copy']) {
      this.openUploadDialog(mapElement);
    } else {
      this.signDocument(mapElement);
    }
  }

  async viewDocument(mapElement: DocumentMapElement) {
    const { buffer, type, title } = await this.getDocument(mapElement);
    if(!buffer) return;
    this.document.viewDocument(buffer, type, title);
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

  openDocumentHistory(mapElement: DocumentMapElement) {
    this.dialog.open<DocumentUploadHistoryDialogComponent, DocumentUploadHistoryDialogData>(DocumentUploadHistoryDialogComponent, {
      data: {
        paperId: this.paperId,
        document: mapElement.requiredDocument,
      },
      autoFocus: 'dialog',
    });
  }

  private async getDocument(mapElement: DocumentMapElement) {
    mapElement.actionPending = true;
    let snackbarRef = this.snackbar.open("Se descarcă documentul...", null, {
      duration: null,
    });
    const id = mapElement.lastId;
    const type = this.documents.find(doc => doc.id == id).mimeType;
    const title = [mapElement.title, this.documentNameSuffix].filter(Boolean).join(' - ').slice(0, 255);
    const buffer = await firstValueFrom(this.document.getDocument(id));
    mapElement.actionPending = false;
    snackbarRef.dismiss();
    return {
      buffer,
      type,
      title
    };
  }

}

interface DocumentMap {
  [name: string]: DocumentMapElement
}

export interface DocumentMapElement {
  requiredDocument: PaperRequiredDocument;
  title: string;
  category: PaperDocumentCategory;
  requiredTypes: PaperDocumentTypes;
  actualTypes: PaperDocumentTypes;
  lastId: number;
  actionPending?: boolean;
  nextAction?: DocumentAction;
  isUploaded: boolean;
  uploadBy: PaperDocumentUploadBy;
  reuploadRequest?: DocumentReuploadRequest;
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
  uploadInstructions?: string;
}
export interface PaperDocumentEvent {
  documentName: string;
  action: 'sign' | 'uploadCopy';
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
