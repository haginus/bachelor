import { Component, DoCheck, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { PaperDocument } from 'src/app/services/auth.service';
import { StudentService } from 'src/app/services/student.service';
import { DocumentUploadDialogComponent } from '../document-upload-dialog/document-upload-dialog.component';

@Component({
  selector: 'app-paper-document-list',
  templateUrl: './paper-document-list.component.html',
  styleUrls: ['./paper-document-list.component.scss']
})
export class PaperDocumentListComponent implements OnChanges {

  constructor(private snackbar: MatSnackBar, private dialog: MatDialog,
    private student: StudentService) { }

  @Input() requiredDocuments: PaperRequiredDocument[] = [];
  @Input() documents: PaperDocument[] = [];
  // In what quality is the viewer of this list
  @Input() perspective: 'student' | 'teacher' | 'committee' = 'student';
  // Paper ID (needed for teacher / committee to know where to upload the document)
  @Input() paperId: number;
  // Emit events when documents change (signed / copy uploaded)
  @Output() documentEvents = new EventEmitter<PaperDocumentEvent>();
  // Output variable that tells whether all the documents are uploaded (by uploader and category)
  @Output() areDocumentsUploaded = new EventEmitter<AreDocumentsUploaded>();

  ngOnChanges(changes: SimpleChanges): void {
    this._generateDocumentMap();
  }

  documentMap: DocumentMap = {}

  private _computeNextAction(doc: DocumentMapElement): DocumentAction {
    const isGenerated = doc.actualTypes.generated == true;
    const isSigned = doc.actualTypes.signed == true;
    const isUploaded = doc.actualTypes.copy == true;

    const needsGenerated = doc.requiredTypes.generated == true;
    const needsSigned = doc.requiredTypes.signed == true;
    const needsUploaded = doc.requiredTypes.copy == true;

    const canUpload = doc.uploadBy == this.perspective;

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
        uploadBy: requiredDoc.uploadBy, category: requiredDoc.category };
      doc['nextAction'] = this._computeNextAction(doc);
      documentMap[docName] = doc;
    });
    this.documentMap = documentMap;
    this._generateAreDocumentsUploaded();
  }

  private _generateAreDocumentsUploaded(): void {
    let areDocumentsUploaded: AreDocumentsUploaded = {
      byCategory: {},
      byUploader: {
        student: true,
        teacher: true,
        committee: true
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
        }
      });
    });
    this.areDocumentsUploaded.emit(areDocumentsUploaded);
  }

  openDocumentDialog(action: 'sign' | 'uploadCopy', documentName: string, documentId?: number) {
    const document = this.requiredDocuments.find(doc => doc.name == documentName);
    let dialogRef = this.dialog.open(DocumentUploadDialogComponent, {
      data: {
        action,
        document,
        documentId,
        paperId: this.paperId,
        perspective: this.perspective
      },
      width: '100%',
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

  viewDocument(mapElement: DocumentMapElement) {
    mapElement.actionPending = true;
    let snackbarRef = this.snackbar.open("Se descarcă documentul...", null, {
      duration: null // infinite duration
    });

    const id = mapElement.lastId;
    const type = this.documents.find(doc => doc.id == id).mimeType;
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

}

interface DocumentMap {
  [name: string]: DocumentMapElement
}

type UploadBy = 'student' | 'teacher' | 'committee';

interface DocumentMapElement {
  title: string,
  category: string,
  requiredTypes: PaperDocumentTypes,
  actualTypes: PaperDocumentTypes,
  lastId: number,
  actionPending?: boolean,
  nextAction?: DocumentAction,
  uploadBy: UploadBy;
}

type DocumentAction = 'sign' | 'upload'  | 'view' | null;

export interface PaperDocumentTypes {
  generated?: boolean,
  signed?: boolean,
  copy?: boolean
}

export interface PaperRequiredDocument {
  title: string,
  name: string,
  category: string,
  types: PaperDocumentTypes,
  acceptedMimeTypes: string,
  acceptedExtensions: string[],
  uploadBy: UploadBy;
}

export interface PaperDocumentEvent {
  documentName: string,
  action: 'sign' | 'uploadCopy'
}

export interface AreDocumentsUploaded {
  byCategory: {
    [name: string]: boolean
  };
  byUploader: {
    [name in UploadBy]: boolean
  }
}