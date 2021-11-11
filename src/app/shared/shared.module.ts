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
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatMenuModule } from "@angular/material/menu";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { UserSnippetComponent } from './user-snippet/user-snippet.component';
import { UserProfileEditorComponent } from './user-profile-editor/user-profile-editor.component';
import { ReactiveFormsModule } from "@angular/forms";
import { ApiUrlPipe } from "../pipes/api-url";

const deps = [
    MatProgressBarModule,
    MatDialogModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatExpansionModule,
    MatTableModule,
    MatToolbarModule,
    MatMenuModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
]

@NgModule({
    declarations: [
        LoadingComponent,
        CommonDialogComponent,
        ApplicationListComponent,
        DocumentUploadDialogComponent,
        PaperDocumentListComponent,
        PaperGradeTableComponent,
        FaqComponent,
        SessionInfoComponent,
        UserSnippetComponent,
        UserProfileEditorComponent,
        ApiUrlPipe
    ],
    imports: [
        CommonModule,
        ...deps
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
        SessionInfoComponent,
        UserSnippetComponent,
        UserProfileEditorComponent,
        ...deps
    ]
  })
  export class SharedModule { }