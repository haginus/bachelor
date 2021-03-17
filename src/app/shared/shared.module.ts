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



@NgModule({
    declarations: [
        LoadingComponent,
        CommonDialogComponent,
        ApplicationListComponent
    ],
    imports: [
        CommonModule,
        MatProgressBarModule,
        MatDialogModule,
        MatButtonModule,
        MatCardModule,
        MatListModule
    ],
    exports: [
        LoadingComponent,
        CommonDialogComponent,
        ApplicationListComponent
    ]
  })
  export class SharedModule { }