import { NgModule } from "@angular/core";
import { MatProgressBarModule } from "@angular/material/progress-bar";
import { LoadingComponent } from "./loading/loading.component";



@NgModule({
    declarations: [
        LoadingComponent
    ],
    imports: [
        MatProgressBarModule
    ],
    exports: [
        LoadingComponent
    ]
  })
  export class SharedModule { }