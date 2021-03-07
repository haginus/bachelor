import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { Offer, TeacherService } from 'src/app/services/teacher.service';
import { CommonDialogComponent } from 'src/app/shared/common-dialog/common-dialog.component';
import { TeacherOfferDialogComponent } from '../../dialogs/teacher-offer-dialog/teacher-offer-dialog.component';

@Component({
  selector: 'teacher-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class TeacherOffersComponent implements OnInit, OnDestroy {

  constructor(private teacher: TeacherService, private dialog: MatDialog) { }

  offers: Offer[] = []
  offerSubscription: Subscription;
  isLoadingOffers: boolean = true;

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

  editOffer(id: number) {
    const offer = this.offers.find(offer => offer.id == id);

    let dialogRef = this.dialog.open(TeacherOfferDialogComponent, {
      data: {
        mode: 'edit',
        offer: { ...offer }
      }
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.getOffers();
      }
    })
  }

  addOffer() {

    let dialogRef = this.dialog.open(TeacherOfferDialogComponent, {
      data: {
        mode: 'create'
      }
    })

    dialogRef.afterClosed().subscribe(res => {
      if(res) {
        this.getOffers();
      }
    })
  }

  deleteOffer(id: number) {
    let dialogRef = this.dialog.open(CommonDialogComponent, {
      data: {
        title: "Doriți să ștergeți această ofertă?",
        content: "Toate cererile în curs de la studenți vor fi revocate.",
        actions: [
          {
            name: "Anulați",
            value: false
          },
          {
            name: "Ștergeți",
            value: true
          }
        ]
      }
    });
    dialogRef.afterClosed().subscribe(console.log)
  }


}
