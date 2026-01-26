import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { Observable, firstValueFrom } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { AuthService, Paper, UserData } from '../../../services/auth.service';
import { Topic, TopicsService } from '../../../services/topics.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LoadingComponent } from '../loading/loading.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { PapersService } from '../../../services/papers.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-paper',
  templateUrl: './edit-paper.component.html',
  styleUrls: ['./edit-paper.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    AsyncPipe,
  ]
})
export class EditPaperComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public paper: Paper,
    private dialog: MatDialogRef<EditPaperComponent>,
    private snackBar: MatSnackBar,
    private topic: TopicsService,
    private papersService: PapersService,
    private auth: AuthService
  ) {
    this.filteredTopics = this.paperForm.get("topics").valueChanges.pipe(
      startWith(null),
      map((topicName: string | null) => typeof topicName == 'string' ? this._filter(topicName) : this.remainingTopics.slice())
    );
  }

  user!: UserData;

  paperForm = new FormGroup({
    "title": new FormControl(this.paper.title, [Validators.required, Validators.minLength(3), Validators.maxLength(256)]),
    "description": new FormControl(this.paper.description, [Validators.required, Validators.minLength(64), Validators.maxLength(1024)]),
    "topics": new FormControl('')
  });

  @ViewChild('topicInput') topicInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;

  selectedTopics: Topic[] = [];
  remainingTopics: Topic[] = [];
  filteredTopics: Observable<Topic[]>; // Observable of filterd topics while user is typing
  isLoadingQuery = false;


  ngOnInit(): void {
    this.selectedTopics = [...this.paper.topics];
    let subscription = this.topic.findAll().subscribe(topics => {
      // remove the currently selected topics from the topics list
      this.selectedTopics.forEach(selectedTopic => {
        const idx = topics.findIndex(topic => topic.id == selectedTopic.id);
        if(idx > 0) {
          topics.splice(idx, 1);
        }
      })
      this.remainingTopics = topics;
      subscription.unsubscribe();
    });
    this.auth.userData.subscribe(user => {
      this.user = user;
    });
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

  selectedTopic(event: MatAutocompleteSelectedEvent): void {
    const topic = event.option.value;
    const index = this.remainingTopics.indexOf(topic);
    if (index >= 0) {
      this.remainingTopics.splice(index, 1);
    }

    this.selectedTopics.push(topic);
    this.topicInput.nativeElement.value = '';
    this.paperForm.get("topics").setValue(null);
  }

  async savePaper() {
    const title = this.paperForm.get("title").value;
    const description = this.paperForm.get("description").value;
    const topicIds = this.selectedTopics.map(topic => topic.id);
    this.isLoadingQuery = true;
    try {
      const result = await firstValueFrom(
        this.papersService.update(this.paper.id, { title, description, topicIds })
      );
      let snackMessage = "Lucrarea a fost salvată.";
      if(result.documentsGenerated) {
        snackMessage += " Documentele au fost regenerate.";
      }
      this.snackBar.open(snackMessage, null, { duration: 8000 });
      this.dialog.close(result);
    } finally {
      this.isLoadingQuery = false;
    }
  }

  private _filter(topicName: string): Topic[] {
    const topicNameNorm = this._normalize(topicName);
    return this.remainingTopics.filter(topic => this._normalize(topic.name).includes(topicNameNorm));
  }

  private _normalize = (str: string) => str.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");


}
