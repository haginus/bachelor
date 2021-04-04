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
import { TranslateModule } from "@ngx-translate/core";


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
        MatListModule,
        MatIconModule,
        FlexLayoutModule,
        MatExpansionModule,
        TranslateModule
    ],
    exports: [
        LoadingComponent,
        CommonDialogComponent,
        ApplicationListComponent,
        FlexLayoutModule,
        MatExpansionModule,
        TranslateModule
    ]
  })
  export class SharedModule { }