import { Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly isDarkModeSource = new BehaviorSubject<boolean>(this.getInitialTheme());
  isDarkMode$ = this.isDarkModeSource.asObservable();
  isDarkMode = this.getInitialTheme();

  constructor() {
    this.isDarkModeSource.pipe(takeUntilDestroyed()).subscribe(isDark => {
      this.isDarkMode = isDark;
      this.updateTheme();
    });
  }

  private getInitialTheme(): boolean {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
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
