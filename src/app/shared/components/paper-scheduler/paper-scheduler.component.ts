import { Component, Inject, Pipe, PipeTransform } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CdkDrag, CdkDragDrop, CdkDropList, CdkDropListGroup, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormControl, ReactiveFormsModule, ValidatorFn } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { firstValueFrom } from 'rxjs';
import { DatetimePipe } from '../../pipes/datetime.pipe';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { arrayMap } from '../../../lib/utils';
import { LoadingComponent } from '../loading/loading.component';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommitteesService } from '../../../services/committees.service';
import { Committee, Paper } from '../../../lib/types';

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
  selector: 'app-change-time-dialog',
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

const autoScheduleSortOptions = {
  byId: (a: ExtendedPaper, b: ExtendedPaper) => a.id - b.id,
  byStudentName: (a: ExtendedPaper, b: ExtendedPaper) => a.student.fullName.toLocaleLowerCase().localeCompare(b.student.fullName),
  byTeacherName: (a: ExtendedPaper, b: ExtendedPaper) => {
    const teacherA = [a.teacher.lastName, a.teacher.firstName].filter(Boolean).join(' ').toLocaleLowerCase();
    const teacherB = [b.teacher.lastName, b.teacher.firstName].filter(Boolean).join(' ').toLocaleLowerCase();
    const teacherSort = teacherA.localeCompare(teacherB);
    return teacherSort === 0 ? autoScheduleSortOptions.byStudentName(a, b) : teacherSort;
  },
  bySpecializationStudent: (a: ExtendedPaper, b: ExtendedPaper) => {
    const specializationSort = a.student.specialization.id - b.student.specialization.id;
    return specializationSort === 0 ? autoScheduleSortOptions.byStudentName(a, b) : specializationSort;
  },
  bySpecializationTeacher: (a: ExtendedPaper, b: ExtendedPaper) => {
    const specializationSort = a.student.specialization.id - b.student.specialization.id;
    return specializationSort === 0 ? autoScheduleSortOptions.byTeacherName(a, b) : specializationSort;
  },
};

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
    MatSlideToggleModule,
    MatSnackBarModule,
    LoadingComponent,
    CdkDropListGroup,
    CdkDropList,
    CdkDrag,
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
    private readonly committeesService: CommitteesService,
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
    this.minutesPerPaper.valueChanges.pipe(takeUntilDestroyed()).subscribe(minutesPerPaper => {
      const scheduledPapers = Object.entries(this.papersPerDay).filter(([key]) => +key !== 0).map(([_, value]) => value);
      scheduledPapers.forEach(group => {
        for(let i = 1; i < group.length; i++) {
          group[i].scheduledGradingDraft = new Date(group[i - 1].scheduledGradingDraft.getTime() + minutesPerPaper * MINUTE);
        }
      });
    });
    this.autoScheduleSort.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.sortUnassignedPapers();
    });
    this.sortUnassignedPapers();
  }

  protected readonly days = this.committee.activityDays.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  protected papersPerDay: Record<number, ExtendedPaper[]>;
  protected minutesPerPaper = new FormControl<number>(this.committee.paperPresentationTime, { nonNullable: true });
  protected publicScheduling = new FormControl<boolean>(this.committee.publicScheduling, { nonNullable: true });
  protected autoScheduleSort = new FormControl<keyof typeof autoScheduleSortOptions>('byStudentName', { nonNullable: true });
  protected minutesPerPaperOptions = [10, 12, 14, 15, 16, 18, 20, 22, 24, 25, 26, 28, 30];
  protected isSubmitting = false;

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

  sortUnassignedPapers() {
    return this.papersPerDay[0].sort((a, b) => {
      const sortResult = autoScheduleSortOptions[this.autoScheduleSort.value](a, b);
      if(a.isValid === null) {
        return 10000 + sortResult;
      }
      if(b.isValid === null) {
        return -10000 + sortResult;
      }
      return sortResult;
    });
  }

  autoSchedule() {
    const unassignedPapers = this.sortUnassignedPapers();
    const targetPaperCountPerDay = Math.floor(this.committee.papers.length / this.days.length);
    let remainder = this.committee.papers.length % this.days.length;
    const dayContainers = this.days.map((day) => {
      const data = this.papersPerDay[day.id];
      let includeCount = targetPaperCountPerDay - data.length;
      if(remainder > 0) {
        includeCount++;
        remainder--;
      }
      return {
        data,
        day,
        includeCount,
      };
    }).sort((a, b) => a.data.length - b.data.length);
    const minutesPerPaperMs = this.minutesPerPaper.value * MINUTE;
    dayContainers.forEach((container => {
      for(let i = 0; i < container.includeCount; i++) {
        if(unassignedPapers.length === 0) return;
        const paper = unassignedPapers[0];
        paper.scheduledGradingDraft = container.data.length > 0
          ? new Date(container.data[container.data.length - 1].scheduledGradingDraft.getTime() + minutesPerPaperMs)
          : new Date(container.day.startTime);
        transferArrayItem(
          unassignedPapers,
          container.data,
          0,
          container.data.length,
        );
      }
    }));
  }

  async saveSchedule() {
    const papers = Object.values(this.papersPerDay).flat().map(paper => ({
      paperId: paper.id,
      scheduledGrading: paper.scheduledGradingDraft?.toISOString() || null,
    }));
    const paperMap = arrayMap(papers, paper => paper.paperId);
    this.isSubmitting = true;
    const dto = {
      committeeId: this.committee.id,
      paperPresentationTime: this.minutesPerPaper.value,
      publicScheduling: this.publicScheduling.value,
      papers,
    }
    try {
      const result = await firstValueFrom(this.committeesService.schedulePapers(dto));
      this.snackBar.open('Lucrările au fost programate.');
      this.committee.papers.forEach(paper => {
        paper.scheduledGrading = paperMap[paper.id].scheduledGrading;
      });
      this.committee.paperPresentationTime = this.minutesPerPaper.value;
      this.committee.publicScheduling = this.publicScheduling.value;
      this.dialogRef.close(result);
    } finally {
      this.isSubmitting = false;
    }
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
