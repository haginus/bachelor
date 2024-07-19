import { Component } from '@angular/core';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-sign-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    SignaturePadComponent,
  ],
  templateUrl: './sign-dialog.component.html',
  styleUrl: './sign-dialog.component.scss'
})
export class SignDialogComponent {

}
