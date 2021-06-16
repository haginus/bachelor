import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { LoadingComponent } from "./components/loading/loading.component";

@NgModule({
    declarations: [
        LoadingComponent
    ],
    imports: [
        CommonModule,
        MatProgressBarModule,
        MatProgressSpinnerModule
    ],
    exports: [
        LoadingComponent
    ]
  })
  export class CommonComponentsModule { }