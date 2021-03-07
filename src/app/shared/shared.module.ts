import { NgModule } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { LoadingComponent } from "./loading/loading.component";
import { CommonDialogComponent } from './common-dialog/common-dialog.component';
import { MatDialogModule } from "@angular/material/dialog";
import { CommonModule } from "@angular/common";
import { MatButtonModule } from "@angular/material/button";



@NgModule({
    declarations: [
        LoadingComponent,
        CommonDialogComponent
    ],
    imports: [
        CommonModule,
        MatProgressBarModule,
        MatDialogModule,
        MatButtonModule
    ],
    exports: [
        LoadingComponent,
        CommonDialogComponent
    ]
  })
  export class SharedModule { }