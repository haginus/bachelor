import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { SessionSettingsService } from '../../../services/session-settings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { SudoService } from '../../../services/sudo.service';

@Component({
  selector: 'app-new-session-dialog',
  templateUrl: './new-session-dialog.component.html',
  styleUrls: ['./new-session-dialog.component.scss'],
  standalone: false
})
export class NewSessionDialogComponent implements OnInit {

  constructor(
    private dialog: MatDialogRef<NewSessionDialogComponent>,
    private readonly sessionSettingsService: SessionSettingsService,
    private readonly snackbar: MatSnackBar,
    private readonly sudoService: SudoService,
  ) {}

  isLoading = false;

  async confirmAction() {
    if(!await firstValueFrom(this.sudoService.enterSudoMode())) return;
    this.isLoading = true;
    try {
      const sessionSettings = await firstValueFrom(this.sessionSettingsService.beginNewSession());
      this.dialog.close(sessionSettings);
      this.snackbar.open('S-a trecut la o nouă sesiune.');
    } finally {
      this.isLoading = false;
    }
  }

  ngOnInit(): void {
  }

}
