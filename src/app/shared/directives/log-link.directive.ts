import { Directive, HostListener, inject, input } from '@angular/core';
import { LogsQuery } from '../../services/logs.service';
import { Router } from '@angular/router';

@Directive({
  selector: '[appLogLink]',
})
export class LogLinkDirective {

  filters = input.required<LogsQuery['filters']>();

  private readonly router = inject(Router);

  @HostListener('click')
  onClick(): void {
    const filters = this.filters();
    this.router.navigate(['admin', 'logs'], { state: { filters } });
  }

}
