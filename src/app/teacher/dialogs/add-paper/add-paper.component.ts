import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { combineLatest, Observable, Subscription } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { TeacherService } from '../../../services/teacher.service';
import { Topic, TopicsService } from '../../../services/topics.service';
import { Domain, UserData } from '../../../services/auth.service';
import { PAPER_TYPES } from '../../../lib/constants';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { UserSnippetComponent } from '../../../shared/components/user-snippet/user-snippet.component';
import { AsyncPipe } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-add-paper',
  templateUrl: './add-paper.component.html',
  styleUrls: ['./add-paper.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatSnackBarModule,
    MatStepperModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    LoadingComponent,
    UserSnippetComponent,
    AsyncPipe,
  ],
})
export class AddPaperComponent implements OnInit {

  constructor(
    private teacher: TeacherService,
    private topicService: TopicsService,
    private dialog: MatDialogRef<AddPaperComponent>,
    private snackbar: MatSnackBar
  ) {
    this.filteredTopics = this.paperForm.get("topics").valueChanges.pipe(
      startWith(null),
      map((topicName: string | null) => typeof topicName == 'string' ? this._filter(topicName) : this.remainingTopics.slice())
    )
  }

  paperForm = new FormGroup({
    title: new FormControl("", [Validators.required]),
    description: new FormControl("", [Validators.required, Validators.minLength(64), Validators.maxLength(1024)]),
    topics: new FormControl(""),
    topicIds: new FormControl([], [Validators.required]),
  });

  findStudentForm = new FormGroup({
    firstName: new FormControl(""),
    lastName: new FormControl(""),
    email: new FormControl(""),
    domainId: new FormControl(null),
    studentId: new FormControl(null, [Validators.required])
  });

  userResultsSubscription: Subscription;

  isLoadingQuery = false;
  isLoadingUsers = false;

  userResults: UserData[] = [];
  domains: Observable<Domain[]> = this.teacher.getDomains();

  selectedTopics: Topic[] = [];
  remainingTopics: Topic[] = [];
  filteredTopics: Observable<Topic[]>;

  PAPER_TYPES = PAPER_TYPES;

  ngOnInit(): void {
    const firstNameChange = this.findStudentForm.get('firstName').valueChanges.pipe(startWith(''), debounceTime(500));
    const lastNameChange = this.findStudentForm.get('lastName').valueChanges.pipe(startWith(''), debounceTime(500));
    const emailChange = this.findStudentForm.get('email').valueChanges.pipe(startWith(''), debounceTime(500));
    const domainChange = this.findStudentForm.get('domainId').valueChanges.pipe(startWith(''));
    this.userResultsSubscription = combineLatest([firstNameChange, lastNameChange, emailChange, domainChange]).pipe(
      switchMap(([firstName, lastName, email, domainId]) => {
        this.isLoadingUsers = true;
        return this.teacher.getStudents(firstName, lastName, email, domainId);
      })
    ).subscribe(results => {
      this.userResults = results;
      this.isLoadingUsers = false;
    });
    this.topicService.getTopics().subscribe(topics => {
      this.remainingTopics =
        topics.filter(topic => !this.selectedTopics.find(t => t.id == topic.id));
    });
  }

  savePaper() {
    this.isLoadingQuery = true;
    const topicNames = this.selectedTopics.filter(topic => topic.id == 0).map(topic => topic.name);
    this.topicService.addTopics(topicNames).pipe(
      switchMap(topics => {
        let topicIds = this.selectedTopics.filter(topic => topic.id != 0).map(topic => topic.id);
        topicIds = topicIds.concat(topics.map(topic => topic.id));
        const { title, description } = this.paperForm.value;
        const { studentId } = this.findStudentForm.value;
        return this.teacher.addPaper(studentId, title, description, topicIds);
      })
    ).subscribe(paper => {
      if(paper) {
        this.dialog.close(paper);
        this.snackbar.open("Lucrarea a fost salvată.");
      } else {
        this.isLoadingQuery = false;
      }
    });
  }

  @ViewChild('topicInput') topicInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  separatorKeysCodes: number[] = [ENTER, COMMA];

  addTopic(event: MatChipInputEvent) {
    const input = event.chipInput.inputElement;
    const value = (event.value || '').trim();
    if (input) {
      input.value = '';
    }

    if (value) {
      this.addTopicInternal(value);
    }

    this.paperForm.get("topics").setValue(null);
  }

  private addTopicInternal(value: string) {
    value = value.trim();
    const exists = !!this.selectedTopics.find(topic => topic.name == value);
    if(!exists) {
      this.selectedTopics.push({ id: 0, name: value });
    }
    this.paperForm.get("topicIds").setValue(this.selectedTopics);
  }

  selectedTopic(event: MatAutocompleteSelectedEvent): void {
    const topic = event.option.value;
    const index = this.remainingTopics.indexOf(topic);
    if (index >= 0) {
      this.remainingTopics.splice(index, 1);
    }

    this.selectedTopics.push(topic);
    this.topicInput.nativeElement.value = '';
    this.paperForm.get("topics").setValue(null);
    this.paperForm.get("topicIds").setValue(this.selectedTopics);
  }

  removeTopic(topic: Topic) {
    const index = this.selectedTopics.indexOf(topic);
    if(topic.id != 0) {
      this.remainingTopics.push(topic);
    }

    if (index >= 0) {
      this.selectedTopics.splice(index, 1);
    }
    this.paperForm.get("topicIds").setValue(this.selectedTopics);
  }

  private _filter(topicName: string) : Topic[] {
    const topicNameNorm = this._normalize(topicName);
    return this.remainingTopics.filter(topic => this._normalize(topic.name).includes(topicNameNorm));
  }

  handleTopicBlur(event: FocusEvent, value: string) {
    if((event.relatedTarget as any)?.tagName == 'MAT-OPTION') return;
    if ((value || '').trim()) {
      this.addTopicInternal(value);
    }
    this.topicInput.nativeElement.value = '';
    this.paperForm.get("topics").setValue(null);
  }

  private _normalize = (str: string) => str.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  get topicsControl() {
    return this.paperForm.get("topics");
  }

  get resultedPaper() {
    const studentForm = this.findStudentForm.value;
    const paperForm = this.paperForm.value;
    const user = this.userResults.find(user => user.id == studentForm.studentId);
    return {
      ...paperForm,
      user
    }
  }

}
