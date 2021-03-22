import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { combineLatest, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Paper } from 'src/app/services/auth.service';
import { StudentExtraData, StudentService } from 'src/app/services/student.service';
import { StudentExtraDataEditorComponent } from '../../dialogs/student-extra-data-editor/student-extra-data-editor.component';

@Component({
  selector: 'app-student-paper',
  templateUrl: './paper.component.html',
  styleUrls: ['./paper.component.scss']
})
export class StudentPaperComponent implements OnInit {

  constructor(private dialog: MatDialog, private student: StudentService) { }

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
      let doc = { requiredTypes: requiredDoc.types, actualTypes, title: requiredDoc.title };
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
          }
          this.isWaitingForDocumentGeneration = false;
        })
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
      }
    },
    {
      title: "Declarație pe proprie răspundere",
      name: "statutory_declaration",
      types: {
        generated: true,
        signed: true
      }
    },
    {
      title: "Formular de lichidare",
      name: "liquidation_form",
      types: {
        generated: true,
        signed: true
      }
    },
    {
      title: "Copie C.I.",
      name: "identity_card",
      types: {
        copy: true
      }
    }
  ]

}

interface RequiredDocument {
  title: string,
  name: string,
  types: DocumentTypes
}

interface DocumentMap {
  [name: string]: {
    title: string,
    requiredTypes: DocumentTypes,
    actualTypes: DocumentTypes
  }
}

interface DocumentTypes {
  generated?: boolean,
  signed?: boolean,
  copy?: boolean
}
