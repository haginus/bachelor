import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class LoaderService {

  constructor(
    private readonly snackBar: MatSnackBar,
  ) {}

  private eventsSource = new Subject<LoaderEvent>();
  events = this.eventsSource.asObservable();

  async loadResources<T extends Promise<any>[]>(resources: T) {
    this.eventsSource.next({ type: 'LoadStart' });
    try {
      const result = await Promise.all(resources);
      return result;
    } catch {
      this.snackBar.open('A apărut o eroare.');
      throw new Error();
    } finally {
      this.eventsSource.next({ type: 'LoadEnd' });
    }
  }
}

export type LoaderEvent =
  | { type: 'LoadStart' }
  | { type: 'LoadEnd' };
