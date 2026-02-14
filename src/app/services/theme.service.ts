import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly isDarkModeSource = new BehaviorSubject<boolean>(false);
  isDarkMode$ = this.isDarkModeSource.asObservable();
  isDarkMode = false;

  constructor() {
    this.isDarkModeSource.pipe(takeUntilDestroyed()).subscribe(isDark => {
      this.isDarkMode = isDark;
      this.updateTheme();
    });
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkModeSource.next(isDark);
  }

  toggleTheme() {
    this.isDarkModeSource.next(!this.isDarkMode);
  }

  setTheme(isDark: boolean) {
    this.isDarkModeSource.next(isDark);
  }

  private updateTheme() {
    localStorage.setItem('theme', this.isDarkMode ? 'dark' : 'light');
    if (this.isDarkMode) {
      document.documentElement.classList.add('dark-theme');
    } else {
      document.documentElement.classList.remove('dark-theme');
    }
  }
}
