import { NgModule } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { LoadingComponent } from "./loading/loading.component";
import { CommonDialogComponent } from './common-dialog/common-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";
import { ApplicationListComponent } from './application-list/application-list.component';
import { MatCardModule } from "@angular/material/card";
import { MatListModule } from "@angular/material/list";
import { MatIconModule } from "@angular/material/icon";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatExpansionModule } from '@angular/material/expansion';
import { PaperDocumentListComponent } from './paper-document-list/paper-document-list.component';
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { DocumentUploadDialogComponent } from "./document-upload-dialog/document-upload-dialog.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { PaperGradeTableComponent } from './paper-grade-table/paper-grade-table.component';
import { MatTableModule } from "@angular/material/table";
import { FaqComponent } from './faq/faq.component';
import { SessionInfoComponent } from './session-info/session-info.component';


@NgModule({
    declarations: [
        LoadingComponent,
        CommonDialogComponent,
        ApplicationListComponent,
        DocumentUploadDialogComponent,
        PaperDocumentListComponent,
        PaperGradeTableComponent,
        FaqComponent,
        SessionInfoComponent
    ],
    imports: [
        CommonModule,
        MatProgressBarModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatListModule,
        MatIconModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        FlexLayoutModule,
        MatExpansionModule,
        MatTableModule
    ],
    exports: [
        LoadingComponent,
        CommonDialogComponent,
        ApplicationListComponent,
        FlexLayoutModule,
        MatExpansionModule,
        PaperDocumentListComponent,
        DocumentUploadDialogComponent,
        PaperGradeTableComponent,
        FaqComponent,
        SessionInfoComponent
    ]
  })
  export class SharedModule { }