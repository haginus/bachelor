import { Component, Inject, Pipe, PipeTransform } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Committee, Paper } from '../../../services/auth.service';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { DatetimePipe } from '../../pipes/datetime.pipe';

const MINUTE = 60 * 1000;

function timeToMinutes(timeStr: string) {
  const [hours, minutes] = timeStr.split(':');
  return +hours * 60 + +minutes;
}

@Pipe({ name: 'time', standalone: true })
export class TimePipe implements PipeTransform {
  transform (input: Date): string {
    return [input.getHours(), input.getMinutes()].map(digits => digits.toString().padStart(2, '0')).join(':');
  }
}

@Component({
  selector: 'app',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    TimePipe,
  ],
  template: `
    <div matDialogTitle>Editați timpul programării</div>
    <div matDialogContent>
      <p>
        Editați timpul la care lucrarea va fi evaluată pentru a adăuga/elimina o pauză. <br>
        Nu puteți seta un timp care să schimbe ordinea lucrărilor.
      </p>
      <mat-form-field style="width: 100%;" appearance="outline">
        <mat-label>Timp programare</mat-label>
        <input matInput [formControl]="timeControl" type="time" [min]="data.minTime | time" />
        <mat-hint>Timpul minim: <b>{{ data.minTime | time }}</b></mat-hint>
      </mat-form-field>
    </div>
    <div matDialogActions align="end">
      <button mat-button mat-dialog-close>Anulați</button>
      <button mat-button [mat-dialog-close]="getMinuteDelta()" [disabled]="timeControl.invalid">Editați</button>
    </div>
  `
})
class ChangeTimeDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) protected readonly data: { paper: ExtendedPaper; minTime: Date },
  ) {
  }

  private readonly timePipe = new TimePipe();
  protected initialTime = this.timePipe.transform(this.data.paper.scheduledGrading);

  timeControl = new FormControl<string>(this.initialTime, [
    minTimeValidator(this.timePipe.transform(this.data.minTime))
  ]);

  getMinuteDelta() {
    return timeToMinutes(this.timeControl.value) - timeToMinutes(this.initialTime);
  }
}

@Component({
  selector: 'app-paper-scheduler',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
    NgFor,
    TimePipe,
    DatetimePipe,
  ],
  templateUrl: './paper-scheduler.component.html',
  styleUrl: './paper-scheduler.component.scss'
})
export class PaperSchedulerComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) protected readonly committee: Committee,
    private readonly dialog: MatDialog,
  ) {
    const papers = JSON.parse(JSON.stringify(this.committee.papers));
    this.papersPerDay = {
      0: papers,
      ...this.days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {}),
    };
    this.minutesPerPaper.setValue(15, { emitEvent: false });
    this.minutesPerPaper.valueChanges.pipe(takeUntilDestroyed()).subscribe(minutesPerPaper => {
      const scheduledPapers = Object.entries(this.papersPerDay).filter(([key]) => +key !== 0).map(([_, value]) => value);
      scheduledPapers.forEach(group => {
        for(let i = 1; i < group.length; i++) {
          group[i].scheduledGrading = new Date(group[i - 1].scheduledGrading.getTime() + minutesPerPaper * MINUTE);
        }
      });
    });
  }

  protected readonly days = [
    { id: 1, activityStartTime: '2024-09-23T06:00:00.000Z' },
    { id: 2, activityStartTime: '2024-09-24T07:00:00.000Z' },
  ];

  protected papersPerDay: Record<number, ExtendedPaper[]>;
  protected minutesPerPaper = new FormControl<number>(15);

  drop(event: CdkDragDrop<ExtendedPaper[], ExtendedPaper[], ExtendedPaper>) {
    if(event.previousContainer === event.container && event.previousIndex === event.currentIndex) {
      return;
    }
    const paper = event.previousContainer.data[event.previousIndex];
    const containerDay = this.days.find(day => day.id === +event.container.id);
    const minutesPerPaperMs = this.minutesPerPaper.value * MINUTE;
    paper.scheduledGrading =
      containerDay
        ? event.container.data[event.currentIndex]?.scheduledGrading ||
          (
            event.container.data.length === 0
              ? new Date(containerDay.activityStartTime)
              : new Date(event.container.data[event.container.data.length - 1].scheduledGrading.getTime() + minutesPerPaperMs)
          )
        : null;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      if(event.container.id != '0') {
        if(event.currentIndex > event.previousIndex) {
          for(let i = event.previousIndex; i < event.currentIndex; i++) {
            const paper = event.container.data[i];
            paper.scheduledGrading = new Date(paper.scheduledGrading.getTime() - minutesPerPaperMs);
          }
        } else if(event.currentIndex < event.previousIndex) {
          for(let i = event.currentIndex + 1; i <= event.previousIndex; i++) {
            const paper = event.container.data[i];
            paper.scheduledGrading = new Date(paper.scheduledGrading.getTime() + minutesPerPaperMs);
          }
        }
      }
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      if(event.previousContainer.id != '0') {
        for(let i = event.previousIndex; i < event.previousContainer.data.length; i++) {
          const paper = event.previousContainer.data[i];
          paper.scheduledGrading = new Date(paper.scheduledGrading.getTime() - minutesPerPaperMs);
        }
      }
      if(event.container.id != '0') {
        for(let i = event.currentIndex + 1; i < event.container.data.length; i++) {
          const paper = event.container.data[i];
          paper.scheduledGrading = new Date(paper.scheduledGrading.getTime() + minutesPerPaperMs);
        }
      }
    }

  }

  async changePaperTime(day: typeof this.days[0], paperIndex: number) {
    const paper = this.papersPerDay[day.id][paperIndex];
    const minTime = paperIndex === 0
      ? new Date(day.activityStartTime)
      : new Date(this.papersPerDay[day.id][paperIndex - 1].scheduledGrading.getTime() + this.minutesPerPaper.value * MINUTE);
    const dialogRef = this.dialog.open(ChangeTimeDialogComponent, {
      data: { paper, minTime }
    });
    const minuteDelta = await firstValueFrom(dialogRef.afterClosed());
    if(!minuteDelta) return;
    for(let i = paperIndex; i < this.papersPerDay[day.id].length; i++) {
      const paper = this.papersPerDay[day.id][i];
      paper.scheduledGrading = new Date(paper.scheduledGrading.getTime() + minuteDelta * MINUTE);
    }
  }

  autoSchedule() {
    const unassignedPapers = this.papersPerDay[0];
    const dayContainers = this.days.map((day) => ({
      data: this.papersPerDay[day.id],
      day,
    }));
    const minutesPerPaperMs = this.minutesPerPaper.value * MINUTE;
    while(unassignedPapers.length > 0) {
      const leastPapersContainer = dayContainers
        .reduce((acc, container) => container.data.length < acc.data.length ? container : acc, dayContainers[0]);
      const paper = unassignedPapers[0];
      paper.scheduledGrading = leastPapersContainer.data.length > 0
        ? new Date(leastPapersContainer.data[leastPapersContainer.data.length - 1].scheduledGrading.getTime() + minutesPerPaperMs)
        : new Date(leastPapersContainer.day.activityStartTime);
      transferArrayItem(
        unassignedPapers,
        leastPapersContainer.data,
        0,
        leastPapersContainer.data.length,
      );
    }
  }

}

type ExtendedPaper = Paper & { scheduledGrading: Date; };

function minTimeValidator(minTime: string): ValidatorFn {
  return (control) => {
    const inputTime = control.value as string;
    if(!inputTime) {
      return null;
    }
    return timeToMinutes(inputTime) < timeToMinutes(minTime) ? { minTime: true } : null;
  }
}
