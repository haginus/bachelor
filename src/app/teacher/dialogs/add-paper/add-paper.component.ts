import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom, Observable } from 'rxjs';
import { debounceTime, map, startWith, switchMap } from 'rxjs/operators';
import { TopicsService } from '../../../services/topics.service';
import { DOMAIN_TYPES, PAPER_TYPES } from '../../../lib/constants';
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
import { StudentsService } from '../../../services/students.service';
import { DomainsService } from '../../../services/domains.service';
import { Student, Topic } from '../../../lib/types';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PapersService } from '../../../services/papers.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-add-paper',
  templateUrl: './add-paper.component.html',
  styleUrls: ['./add-paper.component.scss'],
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
  ]
})
export class AddPaperComponent {

  constructor(
    private readonly authService: AuthService,
    private readonly domainsService: DomainsService,
    private readonly studentsService: StudentsService,
    private readonly topicsService: TopicsService,
    private readonly papersService: PapersService,
    private dialog: MatDialogRef<AddPaperComponent>,
    private snackbar: MatSnackBar
  ) {
    this.filteredTopics = this.paperForm.get("topics").valueChanges.pipe(
      startWith(null),
      map((topicName: string | null) => typeof topicName == 'string' ? this._filter(topicName) : this.remainingTopics.slice())
    );
    this.studentLookupForm.valueChanges.pipe(
      takeUntilDestroyed(),
      startWith(this.studentLookupForm.value),
      debounceTime(500),
      switchMap((query) => {
        this.isLoadingUsers = true;
        return this.studentsService.findAll({ ...query, limit: 15 });
      })
    ).subscribe(results => {
      this.studentResults = results.rows;
      this.isLoadingUsers = false;
    });
    this.topicsService.findAll().pipe(takeUntilDestroyed()).subscribe(topics => {
      this.remainingTopics =
        topics.filter(topic => !this.selectedTopics.find(t => t.id == topic.id));
    });
  }

  paperForm = new FormGroup({
    title: new FormControl("", [Validators.required]),
    description: new FormControl("", [Validators.required, Validators.minLength(64), Validators.maxLength(1024)]),
    topics: new FormControl(""),
    topicIds: new FormControl([], [Validators.required]),
  });

  studentLookupForm = new FormGroup({
    firstName: new FormControl(""),
    lastName: new FormControl(""),
    email: new FormControl(""),
    domainId: new FormControl(null),
  });

  selectedStudentControl = new FormControl<Student[]>([], [Validators.minLength(1)]);

  isLoadingQuery = false;
  isLoadingUsers = false;

  studentResults: Student[] = [];
  domains = this.domainsService.findAll();

  selectedTopics: Topic[] = [];
  remainingTopics: Topic[] = [];
  filteredTopics: Observable<Topic[]>;

  PAPER_TYPES = PAPER_TYPES;
  DOMAIN_TYPES = DOMAIN_TYPES;

  async savePaper() {
    this.isLoadingQuery = true;
    try {
      let topicIds = this.selectedTopics.filter(topic => topic.id != 0).map(topic => topic.id);
      const newTopicNames = this.selectedTopics.filter(topic => topic.id == 0).map(topic => topic.name);
      if(newTopicNames.length > 0) {
        const topics = await firstValueFrom(this.topicsService.bulkCreate(newTopicNames));
        topicIds = [...topicIds, ...topics.map(topic => topic.id)];
      }
      const { title, description } = this.paperForm.value;
      const studentId = this.selectedStudentControl.value?.[0]?.id;
      const teacherId = (await firstValueFrom(this.authService.userData)).id;
      const paper = await firstValueFrom(
        this.papersService.create({ title, description, topicIds, studentId, teacherId })
      );
      this.dialog.close(paper);
      this.snackbar.open("Lucrarea a fost salvată.");
    } finally {
      this.isLoadingQuery = false;
    }
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
    const student = this.selectedStudentControl.value?.[0];
    return {
      ...this.paperForm.value,
      student
    }
  }

}
