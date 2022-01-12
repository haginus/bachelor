import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { Paper } from 'src/app/services/auth.service';
import { StudentService } from 'src/app/services/student.service';
import { Topic, TopicsService } from 'src/app/services/topics.service';

@Component({
  selector: 'app-edit-paper',
  templateUrl: './edit-paper.component.html',
  styleUrls: ['./edit-paper.component.scss']
})
export class EditPaperComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public paper: Paper, private dialog: MatDialogRef<EditPaperComponent>,
    private topic: TopicsService, private student: StudentService) {
    this.filteredTopics = this.paperForm.get("topics").valueChanges.pipe(
      startWith(null),
      map((topicName: string | null) => typeof topicName == 'string' ? this._filter(topicName) : this.remainingTopics.slice())
    );
  }

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
    let subscription = this.topic.getTopics().subscribe(topics => {
      // remove the currently selected topics from the topics list
      this.selectedTopics.forEach(selectedTopic => {
        const idx = topics.findIndex(topic => topic.id == selectedTopic.id);
        if(idx > 0) {
          topics.splice(idx, 1);
        }
      })
      this.remainingTopics = topics;
      subscription.unsubscribe();
    })
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

  savePaper() {
    const title = this.paperForm.get("title").value;
    const description = this.paperForm.get("description").value;
    const topicIds = this.selectedTopics.map(topic => topic.id);
    this.isLoadingQuery = true;
    let sub = this.student.editPaper(title, description, topicIds).subscribe(result => {
      if(result.success) {
        this.dialog.close(result);
      }
      this.isLoadingQuery = false;
      sub.unsubscribe();
    });
  }

  private _filter(topicName: string): Topic[] {
    const topicNameNorm = this._normalize(topicName);
    return this.remainingTopics.filter(topic => this._normalize(topic.name).includes(topicNameNorm));
  }

  private _normalize = (str: string) => str.toLocaleLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  

}
