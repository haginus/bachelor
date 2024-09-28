import { Component, Inject, Pipe, PipeTransform } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
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
import { TeacherService } from '../../../services/teacher.service';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { arrayMap } from '../../../lib/utils';
import { LoadingComponent } from '../loading/loading.component';

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
  protected initialTime = this.timePipe.transform(this.data.paper.scheduledGradingDraft);

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
    MatSnackBarModule,
    LoadingComponent,
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
    private readonly dialogRef: MatDialogRef<PaperSchedulerComponent>,
    private readonly snackBar: MatSnackBar,
    private readonly teacherService: TeacherService,
  ) {
    const papers = (JSON.parse(JSON.stringify(this.committee.papers)) as ExtendedPaper[]).sort((a, b) => (
      new Date(a.scheduledGrading || 0).getTime() - new Date(b.scheduledGrading || 0).getTime()
    ));
    const dayIndex = this.days.reduce((acc, day) => ({ ...acc, [day.startTime.split('T')[0]]: day.id }), {} as Record<string, number>);
    this.papersPerDay = {
      0: [],
      ...this.days.reduce((acc, day) => ({ ...acc, [day.id]: [] }), {}),
    };
    papers.forEach((paper) => {
      const paperDayId = dayIndex[paper.scheduledGrading?.split('T')[0]] || 0;
      paper.scheduledGradingDraft = paperDayId ? new Date(paper.scheduledGrading) : null;
      this.papersPerDay[paperDayId].push(paper);
    });
    this.minutesPerPaper.setValue(this.getMedianPaperDelta(), { emitEvent: false });
    this.minutesPerPaper.valueChanges.pipe(takeUntilDestroyed()).subscribe(minutesPerPaper => {
      const scheduledPapers = Object.entries(this.papersPerDay).filter(([key]) => +key !== 0).map(([_, value]) => value);
      scheduledPapers.forEach(group => {
        for(let i = 1; i < group.length; i++) {
          group[i].scheduledGradingDraft = new Date(group[i - 1].scheduledGradingDraft.getTime() + minutesPerPaper * MINUTE);
        }
      });
    });
  }

  protected readonly days = this.committee.activityDays;

  protected papersPerDay: Record<number, ExtendedPaper[]>;
  protected minutesPerPaper = new FormControl<number>(15);
  protected minutesPerPaperOptions = [10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 26, 28, 30];
  protected isSubmitting = false;

  /** Calculates the most common difference in time between papers */
  private getMedianPaperDelta() {
    const deltaCount: Record<number, number> = {};
    for(const day of this.days) {
      const papers = this.papersPerDay[day.id];
      for(let i = 1; i < papers.length; i++) {
        const delta = (papers[i].scheduledGradingDraft.getTime() - papers[i - 1].scheduledGradingDraft.getTime()) / MINUTE;
        deltaCount[delta] = (deltaCount[delta] + 1) || 1;
      }
    }
    const allowedDeltas = arrayMap(this.minutesPerPaperOptions, value => value);
    Object.keys(deltaCount).forEach(key => {
      if(!allowedDeltas[key]) delete deltaCount[key];
    });
    const maxOcc = Math.max(...Object.values(deltaCount));
    const commonDelta = Object.entries(deltaCount).find(([_, occ]) => occ === maxOcc)?.[0];
    return commonDelta ? +commonDelta : 15;
  }

  drop(event: CdkDragDrop<ExtendedPaper[], ExtendedPaper[], ExtendedPaper>) {
    if(event.previousContainer === event.container && event.previousIndex === event.currentIndex) {
      return;
    }
    const paper = event.previousContainer.data[event.previousIndex];
    const containerDay = this.days.find(day => day.id === +event.container.id);
    const minutesPerPaperMs = this.minutesPerPaper.value * MINUTE;
    paper.scheduledGradingDraft =
      containerDay
        ? event.container.data[event.currentIndex]?.scheduledGradingDraft ||
          (
            event.container.data.length === 0
              ? new Date(containerDay.startTime)
              : new Date(event.container.data[event.container.data.length - 1].scheduledGradingDraft.getTime() + minutesPerPaperMs)
          )
        : null;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      if(event.container.id != '0') {
        if(event.currentIndex > event.previousIndex) {
          for(let i = event.previousIndex; i < event.currentIndex; i++) {
            const paper = event.container.data[i];
            paper.scheduledGradingDraft = new Date(paper.scheduledGradingDraft.getTime() - minutesPerPaperMs);
          }
        } else if(event.currentIndex < event.previousIndex) {
          for(let i = event.currentIndex + 1; i <= event.previousIndex; i++) {
            const paper = event.container.data[i];
            paper.scheduledGradingDraft = new Date(paper.scheduledGradingDraft.getTime() + minutesPerPaperMs);
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
          paper.scheduledGradingDraft = new Date(paper.scheduledGradingDraft.getTime() - minutesPerPaperMs);
        }
      }
      if(event.container.id != '0') {
        for(let i = event.currentIndex + 1; i < event.container.data.length; i++) {
          const paper = event.container.data[i];
          paper.scheduledGradingDraft = new Date(paper.scheduledGradingDraft.getTime() + minutesPerPaperMs);
        }
      }
    }

  }

  async changePaperTime(day: typeof this.days[0], paperIndex: number) {
    const paper = this.papersPerDay[day.id][paperIndex];
    const minTime = paperIndex === 0
      ? new Date(day.startTime)
      : new Date(this.papersPerDay[day.id][paperIndex - 1].scheduledGradingDraft.getTime() + this.minutesPerPaper.value * MINUTE);
    const dialogRef = this.dialog.open(ChangeTimeDialogComponent, {
      data: { paper, minTime }
    });
    const minuteDelta = await firstValueFrom(dialogRef.afterClosed());
    if(!minuteDelta) return;
    for(let i = paperIndex; i < this.papersPerDay[day.id].length; i++) {
      const paper = this.papersPerDay[day.id][i];
      paper.scheduledGradingDraft = new Date(paper.scheduledGradingDraft.getTime() + minuteDelta * MINUTE);
    }
  }

  autoSchedule() {
    const unassignedPapers = this.papersPerDay[0].sort((a, b) => {
      if(a.isValid === null) {
        return Infinity;
      }
      if(b.isValid === null) {
        return -Infinity;
      }
      return a.id - b.id;
    });
    const dayContainers = this.days.map((day) => ({
      data: this.papersPerDay[day.id],
      day,
    }));
    const minutesPerPaperMs = this.minutesPerPaper.value * MINUTE;
    while(unassignedPapers.length > 0) {
      const leastPapersContainer = dayContainers
        .reduce((acc, container) => container.data.length < acc.data.length ? container : acc, dayContainers[0]);
      const paper = unassignedPapers[0];
      paper.scheduledGradingDraft = leastPapersContainer.data.length > 0
        ? new Date(leastPapersContainer.data[leastPapersContainer.data.length - 1].scheduledGradingDraft.getTime() + minutesPerPaperMs)
        : new Date(leastPapersContainer.day.startTime);
      transferArrayItem(
        unassignedPapers,
        leastPapersContainer.data,
        0,
        leastPapersContainer.data.length,
      );
    }
  }

  async saveSchedule() {
    const papers = Object.values(this.papersPerDay).flat().map(paper => ({
      paperId: paper.id,
      scheduledGrading: paper.scheduledGradingDraft?.toISOString() || null,
    }));
    const paperMap = arrayMap(papers, paper => paper.paperId);
    this.isSubmitting = true;
    const result = await firstValueFrom(this.teacherService.schedulePapers(this.committee.id, papers));
    if(result.length > 0) {
      this.snackBar.open('Lucrările au fost programate.');
      this.committee.papers.forEach(paper => {
        paper.scheduledGrading = paperMap[paper.id].scheduledGrading;
      });
      this.dialogRef.close(result);
    }
    this.isSubmitting = false;
  }

}

type ExtendedPaper = Paper & { scheduledGradingDraft: Date; };

function minTimeValidator(minTime: string): ValidatorFn {
  return (control) => {
    const inputTime = control.value as string;
    if(!inputTime) {
      return null;
    }
    return timeToMinutes(inputTime) < timeToMinutes(minTime) ? { minTime: true } : null;
  }
}
