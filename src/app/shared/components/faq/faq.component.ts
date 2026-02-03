import { Component, Input, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
import { MatExpansionModule } from '@angular/material/expansion';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss'],
  standalone: true,
  imports: [
    MatExpansionModule,
  ]
})
export class FaqComponent implements OnInit {

  @Input() resource: string = null;
  faqs: FAQ[];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    const url = `/assets/faq/${this.resource}.json`;
    this.http.get<FAQ[]>(url).pipe(catchError(() => of([]))).subscribe(faqs => {
      this.faqs = faqs;
    });
  }

}

interface FAQ {
  question: string;
  answer: string;
}
