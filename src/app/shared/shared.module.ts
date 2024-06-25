import { NgModule } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingComponent } from './components/loading/loading.component';
import { CommonDialogComponent } from './components/common-dialog/common-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatExpansionModule } from '@angular/material/expansion';
import { PaperDocumentListComponent } from './components/paper-document-list/paper-document-list.component';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DocumentUploadDialogComponent } from './components/document-upload-dialog/document-upload-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PaperGradeTableComponent } from './components/paper-grade-table/paper-grade-table.component';
import { MatTableModule } from '@angular/material/table';
import { FaqComponent } from './components/faq/faq.component';
import { SessionInfoComponent } from './components/session-info/session-info.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserSnippetComponent } from './components/user-snippet/user-snippet.component';
import { UserProfileEditorComponent } from './components/user-profile-editor/user-profile-editor.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ApiUrlPipe } from './pipes/api-url';
import { FixedPipe } from './pipes/fixed.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { EditPaperComponent } from './components/edit-paper/edit-paper.component';
import { PluckPipe } from './pipes/pluck.pipe';
import { JoinPipe } from './pipes/join.pipe';
import { PaperTitlePipe } from './pipes/paper-title.pipe';

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
  MatAutocompleteModule,
  MatChipsModule,
  MatInputModule,
  ReactiveFormsModule,
];

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    UserProfileEditorComponent,
    SessionInfoComponent,
    PaperGradeTableComponent,
    PaperDocumentListComponent,
    LoadingComponent,
    ApplicationListComponent,
    UserSnippetComponent,
    CommonDialogComponent,
    DocumentUploadDialogComponent,
    EditPaperComponent,
    FaqComponent,
    ApiUrlPipe,
    FixedPipe,
    PluckPipe,
    JoinPipe,
    PaperTitlePipe,
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
    EditPaperComponent,
    FixedPipe,
    PluckPipe,
    JoinPipe,
    PaperTitlePipe,
    ...deps,
  ],
})
export class SharedModule {}
