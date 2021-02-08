import { NgModule } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';

const exports = [
  MatCardModule,
  MatButtonModule,
  MatTabsModule,
  MatFormFieldModule,
  MatInputModule,
  MatDividerModule,
  MatIconModule,
  MatStepperModule,
  MatCheckboxModule,
  MatListModule
]

@NgModule({
  declarations: [],
  imports: exports,
  exports: exports
})
export class MaterialModule { }
