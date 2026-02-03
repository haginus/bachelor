import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { firstValueFrom, Observable, Subscription } from 'rxjs';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { map, startWith } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Topic, TopicsService } from '../../../services/topics.service';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { DomainsService } from '../../../services/domains.service';
import { OffersService } from '../../../services/offers.service';
import { Domain, Offer } from '../../../lib/types';

@Component({
  selector: 'app-teacher-offer-dialog',
  templateUrl: './teacher-offer-dialog.component.html',
  styleUrls: ['./teacher-offer-dialog.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    AsyncPipe,
  ],
})
export class TeacherOfferDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TeacherOfferDialogData,
    private readonly topicsService: TopicsService,
    private readonly domainsService: DomainsService,
    private readonly offersService: OffersService,
    private readonly dialog: MatDialogRef<TeacherOfferDialogComponent>,
    private readonly snackbar: MatSnackBar
  ) {
    this.filteredTopics = this.offerForm.get("topics").valueChanges.pipe(
      startWith(null),
      map((topicName: string | null) => typeof topicName == 'string' ? this._filter(topicName) : this.remainingTopics.slice())
    )
  }

  domains: Domain[] = []
  isLoadingDomains = true;
  domainSubscription: Subscription;

  isLoadingQuery: boolean = false; // Indicate when create/edit query is loading

  // Topic Input
  separatorKeysCodes: number[] = [ENTER, COMMA];
  selectedTopics: Topic[] = []  // Topics that have been selected
  remainingTopics: Topic[] = [] // List of topics that have not been selected
  filteredTopics: Observable<Topic[]>; // Observable of filterd topics while user is typing

  @ViewChild('topicInput') topicInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  DOMAIN_TYPES = DOMAIN_TYPES;

  addTopic(event: MatChipInputEvent) {
    const input = event.input;
    const value = event.value;

    // Reset the input value
    if (input) {
      input.value = '';
    }

    if ((value || '').trim()) {
      this.addTopicInternal(value);
    }

    this.offerForm.get("topics").setValue(null);
  }

  private addTopicInternal(value: string) {
    value = value.trim();
    const exists = !!this.selectedTopics.find(topic => topic.name == value);
    if(!exists) {
      this.selectedTopics.push({ id: 0, name: value });
    }
  }

  selectedTopic(event: MatAutocompleteSelectedEvent): void {
    const topic = event.option.value;
    const index = this.remainingTopics.indexOf(topic);
    if (index >= 0) {
      this.remainingTopics.splice(index, 1);
    }

    this.selectedTopics.push(topic);
    this.topicInput.nativeElement.value = '';
    this.offerForm.get("topics").setValue(null);
  }

  removeTopic(topic: Topic) {
    const index = this.selectedTopics.indexOf(topic);
    if(topic.id != 0) {
      this.remainingTopics.push(topic);
    }

    if (index >= 0) {
      this.selectedTopics.splice(index, 1);
    }
  }

  private _filter(topicName: string) : Topic[] {
    const topicNameNorm = this._normalize(topicName);
    return this.remainingTopics.filter(topic => this._normalize(topic.name).includes(topicNameNorm));
  }

  offerForm = new FormGroup({
    "domainId": new FormControl(this.data.offer?.domain!.id, [Validators.required]),
    "topics": new FormControl(null),
    "limit": new FormControl(this.data.offer?.limit, [Validators.required, Validators.min(1)]),
    "description": new FormControl(this.data.offer?.description, [Validators.maxLength(1024)])
  })

  get domainId() { return this.offerForm.get("domainId") }
  get limit() { return this.offerForm.get("limit") }
  get description() { return this.offerForm.get("description") }

  async ngOnInit() {
    if(this.data.offer) {
      this.selectedTopics = [...this.data.offer.topics];
      this.offerForm.get("limit").setValidators([Validators.required, Validators.min(this.data.offer.takenSeats)]);
      this.offerForm.get("limit").updateValueAndValidity(); // ensure user can't change limit below taken places
    }
    this.topicsService.findAll().subscribe(topics => {
      this.remainingTopics = topics.filter(topic => !this.selectedTopics.find(t => t.id == topic.id));
    });
    try {
      this.domains = await firstValueFrom(this.domainsService.findAll());
    } finally {
      this.isLoadingDomains = false;
    }
  }

  addOffer() {
    this.addOrEditOffer(false);
  }

  editOffer() {
    this.addOrEditOffer(true);
  }

  private async addOrEditOffer(isEdit: boolean = false) {
    this.isLoadingQuery = true;
    try {
      let topicIds = this.selectedTopics.filter(topic => topic.id != 0).map(topic => topic.id);
      const newTopicNames = this.selectedTopics.filter(topic => topic.id == 0).map(topic => topic.name);
      if(newTopicNames.length > 0) {
        const topics = await firstValueFrom(this.topicsService.bulkCreate(newTopicNames));
        topicIds = [...topicIds, ...topics.map(topic => topic.id)];
      }
      const dto = {
        domainId: this.domainId.value,
        topicIds,
        limit: this.limit.value,
        description: this.description.value
      }
      const offer = isEdit
        ? await firstValueFrom(this.offersService.update(this.data.offer.id, dto))
        : await firstValueFrom(this.offersService.create(dto));
      this.dialog.close(offer);
      this.snackbar.open("Ofertă salvată.");
    } finally {
      this.isLoadingQuery = false;
    }
  }

  handleTopicBlur(event: FocusEvent, value: string) {
    if((event.relatedTarget as any)?.tagName == 'MAT-OPTION') return;
    if ((value || '').trim()) {
      this.addTopicInternal(value);
    }
    this.topicInput.nativeElement.value = '';
    this.offerForm.get("topics").setValue(null);
  }

  private _normalize = (str: string) => str.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  get topicsControl() {
    return this.offerForm.get("topics");
  }
}

export interface TeacherOfferDialogData {
  mode: 'create' | 'edit';
  offer?: Offer;
}
