import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { Domain } from 'src/app/services/auth.service';
import { Offer, TeacherService } from 'src/app/services/teacher.service';
import { Topic, TopicsService } from 'src/app/services/topics.service';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { map, startWith, switchMap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-teacher-offer-dialog',
  templateUrl: './teacher-offer-dialog.component.html',
  styleUrls: ['./teacher-offer-dialog.component.scss']
})
export class TeacherOfferDialogComponent implements OnInit {
  //TODO: domains, add edit functions

  constructor(@Inject(MAT_DIALOG_DATA) public data: TeacherOfferDialogData, private topicService: TopicsService,
  private teacher: TeacherService, private dialog: MatDialogRef<TeacherOfferDialogComponent>, private snackbar: MatSnackBar) { 
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
    "domainId": new FormControl(this.data.offer?.domainId, [Validators.required]),
    "topics": new FormControl(null),
    "limit": new FormControl(this.data.offer?.limit, [Validators.required, Validators.min(1)]),
    "description": new FormControl(this.data.offer?.description, [Validators.maxLength(1024)])
  })

  get domainId() { return this.offerForm.get("domainId") }
  get limit() { return this.offerForm.get("limit") }
  get description() { return this.offerForm.get("description") }

  ngOnInit(): void {
    if(this.data.offer) {
      this.selectedTopics = [...this.data.offer.topics];
      this.offerForm.get("limit").setValidators([Validators.required, Validators.min(this.data.offer.takenPlaces)]);
      this.offerForm.get("limit").updateValueAndValidity(); // ensure user can't change limit below taken places
    }
    this.topicService.getTopics().subscribe(topics => {
      this.remainingTopics = 
        topics.filter(topic => !this.selectedTopics.find(t => t.id == topic.id));
    });
    this.domainSubscription = this.teacher.getDomains().subscribe(domains => {
      this.domains = domains;
      this.isLoadingDomains = false;
    });
  }

  private _getNewTopics(): string[] {
    return this.selectedTopics.filter(topic => topic.id == 0).map(topic => topic.name);
  }

  addOffer() {
    this.addOrEditOffer(false);
  }

  editOffer() {
    this.addOrEditOffer(true);
  }

  private addOrEditOffer(isEdit: boolean = false) {
    this.isLoadingQuery = true;
    const topicNames = this._getNewTopics();
    this.topicService.addTopics(topicNames).pipe(
      switchMap(topics => {
        let topicIds = this.selectedTopics.filter(topic => topic.id != 0).map(topic => topic.id);
        topicIds = topicIds.concat(topics.map(topic => topic.id)); // get IDs for newly added topics
        return isEdit ? 
          this.teacher.editOffer(this.data.offer.id, this.domainId.value, topicIds, this.limit.value, this.description.value) :
          this.teacher.addOffer(this.domainId.value, topicIds, this.limit.value, this.description.value);
      })
    ).subscribe(res => {
      if(res) {
        this.dialog.close(true);
        this.snackbar.open("Ofertă salvată.");
      } else {
        let snackbarRef = this.snackbar.open("A apărut o eroare.", "Reîncercați");
        let sub = snackbarRef.onAction().subscribe(() => {
          this.addOrEditOffer(isEdit);
          sub.unsubscribe();
        })
      }
      this.isLoadingQuery = false;
    })
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
  mode: 'create' | 'edit',
  offer?: Offer
}