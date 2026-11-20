import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { DEFAULT_TITLE } from '../lib/constants';

@Injectable()
export class AppTitleStrategy extends TitleStrategy {
  private readonly documentTitle = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    this.documentTitle.setTitle(title ? `${title} | ${DEFAULT_TITLE}` : DEFAULT_TITLE);
  }
}
