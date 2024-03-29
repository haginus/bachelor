import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FAQ, MiscService } from 'src/app/services/misc.service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit, OnDestroy {

  constructor(private misc: MiscService) { }

  @Input() resource: string = null;

  faqs: FAQ[];

  subscription: Subscription;

  ngOnInit(): void {
    this.subscription = this.misc.getFAQ(this.resource).subscribe(faqs => {
      this.faqs = faqs;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
