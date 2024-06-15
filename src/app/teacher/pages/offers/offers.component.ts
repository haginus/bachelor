import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { TeacherOfferDialogComponent } from '../../dialogs/teacher-offer-dialog/teacher-offer-dialog.component';
import { TeacherService } from '../../../services/teacher.service';
import { Offer } from '../../../services/student.service';
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
export class TeacherOffersComponent implements OnInit, OnDestroy {

  constructor(private teacher: TeacherService, private dialog: MatDialog, private snackbar: MatSnackBar) { }

  offers: Offer[] = []
  offerSubscription: Subscription;
  isLoadingOffers: boolean = true;

  DOMAIN_TYPES = DOMAIN_TYPES;

  ngOnInit(): void {
    this.getOffers();
  }

  getOffers() {
    this.isLoadingOffers = true;
    this.offerSubscription = this.teacher.getOffers().subscribe(offers => {
      this.offers = offers;
      this.isLoadingOffers = false;
    });
  }

  ngOnDestroy() {
    this.offerSubscription.unsubscribe();
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

  deleteOffer(offer: Offer) {
    if(offer.takenPlaces) {
      let content = '';
      let actions = [];
      if(offer.takenPlaces >= offer.limit) {
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
          this.editOffer({...offer, limit: offer.takenPlaces});
        }
      })
      return;
    }
    let dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: "Doriți să ștergeți această ofertă?",
        content: "Toate cererile în curs de la studenți vor fi revocate.",
        actions: [
          { name: "Anulați", value: false },
          { name: "Ștergeți", value: true }
        ]
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.teacher.deleteOffer(offer.id).subscribe(result => {
          if(result) {
            this.getOffers();
            this.snackbar.open("Ofertă ștearsă.");
          }
        });
      }
    })
  }


}
