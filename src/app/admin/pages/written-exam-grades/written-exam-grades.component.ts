import { afterNextRender, Component, DestroyRef, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { debounceTime, firstValueFrom, map, merge, Subject } from 'rxjs';
import { PaginatedResolverResult } from '../../../lib/resolver-factory';
import { Submission } from '../../../lib/types';
import { FormControl, FormGroup } from '@angular/forms';
import { removeEmptyProperties } from '../../../lib/utils';
import { MatPaginator } from '@angular/material/paginator';
import { DOMAIN_TYPES } from '../../../lib/constants';
import { DomainsService } from '../../../services/domains.service';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { GradeWrittenExamDialogComponent } from '../../dialogs/grade-written-exam-dialog/grade-written-exam-dialog.component';
import { BulkGradeWrittenExamDialogComponent } from '../../dialogs/written-exam-grade-import-dialog/written-exam-grade-import-dialog.component';
import { SudoService } from '../../../services/sudo.service';

@Component({
  selector: 'app-written-exam-grades',
  templateUrl: './written-exam-grades.component.html',
  styleUrl: './written-exam-grades.component.scss',
  standalone: false,
})
export class WrittenExamGradesComponent {

  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly dialogService = inject(MatDialog);
  private readonly domainsService = inject(DomainsService);
  private readonly sudoService = inject(SudoService);

  displayedColumns: string[] = ['status', 'student.fullName', 'student.domain.name', 'writtenExamGrade.initialGrade', 'writtenExamGrade.disputeGrade', 'writtenExamGrade.finalGrade', 'actions'];
  resolverData = toSignal<PaginatedResolverResult<Submission, { sortBy?: string; sortDirection?: 'asc' | 'desc'; studentName?: string; domainId?: number; writtenExamState?: string; }>>(
    this.route.data.pipe(map(data => data['resolverData']))
  );
  domains = toSignal(this.domainsService.findAll());
  showFilters = signal(false);
  performedActions = new Subject<string>();
  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  filterFormDebounced = new FormGroup({
    studentName: new FormControl<string>(''),
  });
  filterForm = new FormGroup({
    domainId: new FormControl<number | null>(null),
    writtenExamState: new FormControl<string | null>(null),
  });
  DOMAIN_TYPES = DOMAIN_TYPES;

  constructor() {
    afterNextRender(() => {
      this.filterForm.patchValue(this.resolverData().params, { emitEvent: false });
      this.filterFormDebounced.patchValue(this.resolverData().params, { emitEvent: false });
      if(Object.keys(this.getFilterValue()).length > 0) {
        this.showFilters.set(true);
      }
      this.performedActions.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        const filterValue = this.getFilterValue();
        this.router.navigate([], {
          relativeTo: this.route,
          replaceUrl: true,
          onSameUrlNavigation: 'reload',
          queryParams: {
            sortBy: this.sort().active || 'id',
            sortDirection: this.sort().direction || 'asc',
            page: this.paginator().pageIndex,
            pageSize: this.paginator().pageSize,
            ...filterValue
          },
        });
      });

      const filterFormChanges$ = merge(
        this.filterFormDebounced.valueChanges.pipe(debounceTime(500)),
        this.filterForm.valueChanges,
      );

      filterFormChanges$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.paginator().pageIndex = 0;
      });

      merge(
        filterFormChanges$,
        this.paginator().page,
        this.sort().sortChange
      ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
        this.performedActions.next("refresh");
      });
    });
  }

  private getFilterValue() {
    return removeEmptyProperties({
      ...this.filterForm.value,
      ...this.filterFormDebounced.value,
    });
  }

  resetFilters() {
    this.filterForm.reset();
    // We don't want to emit valueChanges when resetting the form, as it would trigger an unwanted navigation
    this.filterFormDebounced.reset({}, { emitEvent: false });
  }

  toggleFilters() {
    if(this.showFilters()) {
      this.resetFilters();
    }
    this.showFilters.set(!this.showFilters());
  }

  refreshResults() {
    this.performedActions.next("refresh");
  }

  async gradeWrittenExam(submission: Submission) {
    if(!await firstValueFrom(this.sudoService.enterSudoMode())) return;
    const dialogRef = this.dialogService.open(GradeWrittenExamDialogComponent, {
      data: {
        submission,
        existingGrade: submission.writtenExamGrade,
      }
    });
    const result = await firstValueFrom(dialogRef.afterClosed());
    if(result) {
      submission.writtenExamGrade = result;
      this.performedActions.next("refresh");
    }
  }

  async bulkGradeWrittenExam() {
    if(!await firstValueFrom(this.sudoService.enterSudoMode())) return;
    const dialogRef = this.dialogService.open(BulkGradeWrittenExamDialogComponent);
    if(await firstValueFrom(dialogRef.afterClosed())) {
      this.performedActions.next("refresh");
    }
  }
}
