import { Component, Input, OnInit } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { FAQ_CONTENT } from './faq-content';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  imports: [
    MatExpansionModule,
  ]
})
export class FaqComponent implements OnInit {

  @Input() resource: string = null;
  faqs: FAQ[];

  ngOnInit(): void {
    this.faqs = FAQ_CONTENT[this.resource] || [];
  }

}

interface FAQ {
  question: string;
  answer: string;
}
