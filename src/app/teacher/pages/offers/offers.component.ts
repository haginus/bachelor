import { Component, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { TeacherOfferDialogComponent } from '../../dialogs/teacher-offer-dialog/teacher-offer-dialog.component';
import { CommonDialogComponent } from '../../../shared/components/common-dialog/common-dialog.component';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { OffersService } from '../../../services/offers.service';
import { Offer } from '../../../lib/types';

@Component({
  selector: 'teacher-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss'],
  standalone: true,
  imports: [
    FlexLayoutModule,
    MatDialogModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatCardModule,
    RouterLink,
  ]
})
export class TeacherOffersComponent implements OnInit {

  constructor(
    private readonly offersService: OffersService,
    private dialog: MatDialog,
    private snackbar: MatSnackBar
  ) {}

  offers: Offer[] = []
  isLoadingOffers: boolean = true;

  DOMAIN_TYPES = DOMAIN_TYPES;

  ngOnInit(): void {
    this.getOffers();
  }

  async getOffers() {
    this.isLoadingOffers = true;
    try {
      this.offers = await firstValueFrom(this.offersService.findMine());
    } catch {
      this.offers = [];
      this.snackbar.open("Eroare la încărcarea ofertelor.");
    } finally {
      this.isLoadingOffers = false;
    }
  }

  editOffer(offer: Offer) {
    let dialogRef = this.dialog.open(TeacherOfferDialogComponent, {
      data: {
        mode: 'edit',
        offer: { ...offer }
      },
      minWidth: '60vw',
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.getOffers();
      }
    });
  }

  addOffer() {
    let dialogRef = this.dialog.open(TeacherOfferDialogComponent, {
      data: {
        mode: 'create'
      },
      minWidth: '60vw',
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.getOffers();
      }
    })
  }

  async deleteOffer(offer: Offer) {
    if(offer.takenSeats) {
      let content = '';
      let actions = [];
      if(offer.takenSeats >= offer.limit) {
        content = "Oferta este deja inactivă - studenții nu mai pot trimite cereri noi, deoarece numărul de locuri limită setat a fost atins.";
        actions.push({ name: "OK", value: false });
      } else {
        content = "Inactivați oferta setând limita de locuri la numărul actual de locuri ocupate.";
        actions.push({ name: "Anulați", value: false });
        actions.push({ name: "Mergeți la editare", value: true });
      }
      let dialogRef = this.dialog.open(CommonDialogComponent, {
        data: {
          title: "Ofertele cu cereri acceptate nu pot fi șterse",
          content,
          actions,
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result) {
          this.editOffer({ ...offer, limit: offer.takenSeats });
        }
      })
      return;
    }
    const dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: "Doriți să ștergeți această ofertă?",
        content: "Toate cererile în curs de la studenți vor fi revocate.",
        actions: [
          { name: "Anulați", value: false },
          { name: "Ștergeți", value: true }
        ]
      }
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if(!result) return;
    await firstValueFrom(this.offersService.delete(offer.id));
    this.getOffers();
    this.snackbar.open("Ofertă ștearsă.");
  }

}
