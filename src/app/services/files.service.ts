import { HttpClient, HttpEventType, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { finalize, Observable } from "rxjs";
import { ProgressSnackBarComponent } from "../shared/components/progress-snack-bar/progress-snack-bar.component";
import { DocumentViewerDialogComponent, DocumentViewerDialogData } from "../shared/components/document-viewer-dialog/document-viewer-dialog.component";
import { MatDialog } from "@angular/material/dialog";

@Injectable({
  providedIn: 'any'
})
export class FilesService {

  constructor(
    private readonly http: HttpClient,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  viewFile(data: ArrayBuffer, type: string, title?: string, signOptions?: DocumentViewerDialogData['signOptions']) {
    const blob = new Blob([data], { type });
    const url = window.URL.createObjectURL(blob);
    return this.dialog.open(DocumentViewerDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      data: {
        url,
        type,
        title,
        signOptions,
      },
      autoFocus: 'dialog',
    });
  }

  saveFile(buffer: ArrayBuffer, type: string, downloadTitle: string) {
    const blob = new Blob([buffer], { type });
    const url = window.URL.createObjectURL(blob);
    let anchor = document.createElement("a");
    anchor.download = downloadTitle;
    anchor.href = url;
    anchor.click();
  }

  getFile(url: string, params?: any): Observable<ArrayBuffer> {
    const sbRef = this.openProgressSnackBar('indeterminate');
    const headers = new HttpHeaders({
      'Cache-Control': 'no-store',
    });
    return this.http.get<ArrayBuffer>(url, { headers, responseType: 'arraybuffer' as 'json', params }).pipe(
      finalize(() => sbRef.dismiss())
    );
  }

  getFileWithProgress(url: string, params?: any): Observable<ArrayBuffer> {
    const sbRef = this.openProgressSnackBar('indeterminate');
    const headers = new HttpHeaders({
      'Cache-Control': 'no-store',
    });
    return new Observable<ArrayBuffer>(observer => {
      const subscription = this.http.get<ArrayBuffer>(url, {
        headers,
        responseType: 'arraybuffer' as 'json',
        reportProgress: true,
        observe: 'events',
        params,
      }).subscribe((event) => {
        switch(event.type) {
          case HttpEventType.DownloadProgress:
            if(event.total) {
              const progress = Math.round(event.loaded / event.total * 100);
              sbRef.instance.progress = progress;
              sbRef.instance.mode = 'determinate';
              sbRef.instance.suffix = `${bytesToSize(event.loaded)} / ${bytesToSize(event.total)}`;
            } else {
              sbRef.instance.mode = 'indeterminate';
              sbRef.instance.suffix = '';
            }
            break;
          case HttpEventType.Response:
            observer.next(event.body!);
            observer.complete();
            break;
        }
      });
      return () => {
        subscription.unsubscribe();
        sbRef.dismiss();
      };
    });
  }

  private openProgressSnackBar(mode: 'determinate' | 'indeterminate', title?: string) {
    return this.snackBar.openFromComponent(ProgressSnackBarComponent, {
      duration: undefined,
      data: {
        mode,
        progress: 0,
        title: title ?? 'Se descarcă fișierul...',
      }
    });
  }
}

function bytesToSize(bytes: number) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes == 0) return '0B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + sizes[i];
};
