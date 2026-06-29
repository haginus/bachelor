import { HttpClient, HttpEventType, HttpHeaders, HttpParams, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { defer, finalize, map, Observable } from "rxjs";
import { ProgressSnackBarComponent } from "../shared/components/progress-snack-bar/progress-snack-bar.component";
import { DocumentViewerDialogComponent, DocumentViewerDialogData } from "../shared/components/document-viewer-dialog/document-viewer-dialog.component";
import { MatDialog } from "@angular/material/dialog";

const DefaultIndeterminateTitle = 'Se descarcă fișierul...';
const DefaultDeterminateTitle = 'Se descarcă fișierul...';

@Injectable({
  providedIn: 'root'
})
export class FilesService {

  constructor(
    private readonly http: HttpClient,
    private readonly dialog: MatDialog,
    private readonly snackBar: MatSnackBar,
  ) {}

  viewFile(file: File, signOptions?: DocumentViewerDialogData['signOptions']) {
    return this.dialog.open(DocumentViewerDialogComponent, {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
      data: {
        file,
        signOptions,
      },
      autoFocus: 'dialog',
      panelClass: 'no-radius-dialog',
    });
  }

  saveFile(file: File, downloadTitle?: string) {
    const url = window.URL.createObjectURL(file);
    let anchor = document.createElement("a");
    anchor.download = downloadTitle || file.name;
    anchor.href = url;
    anchor.click();
  }

  viewOrSaveFile(file: File, downloadTitle?: string) {
    if(DocumentViewerDialogComponent.supportsType(file.type)) {
      this.viewFile(file);
    } else {
      this.saveFile(file, downloadTitle);
    }
  }

  private httpResponseToFile(response: HttpResponse<Blob>, fileName?: string, fileType?: string): File {
    const blob = response.body!;
    return new File([blob], getFileName(response) || fileName || 'Fișier', { type: fileType || blob.type });
  }

  getFile(
    url: string,
    {
      params,
      fileName,
      fileType,
      showSnackBar = true,
      indeterminateTitle = DefaultIndeterminateTitle
    }: GetFileOptions = {},
  ): Observable<File> {
    return defer(() => {
      const sbRef = showSnackBar ? this.openProgressSnackBar('indeterminate', indeterminateTitle) : null;
      const headers = new HttpHeaders({
        'Cache-Control': 'no-store',
      });
      return this.http.get(url, { headers, responseType: 'blob', observe: 'response', params }).pipe(
        map(response => this.httpResponseToFile(response, fileName, fileType)),
        finalize(() => sbRef?.dismiss())
      );
    });
  }

  getFileWithProgress(url: string,
    {
      params,
      fileName,
      fileType,
      indeterminateTitle = DefaultIndeterminateTitle,
      determinateTitle = DefaultDeterminateTitle
    }: GetFileWithProgressOptions = {}
  ): Observable<File> {
    return new Observable<File>(observer => {
      const sbRef = this.openProgressSnackBar('indeterminate', indeterminateTitle);
      const headers = new HttpHeaders({
        'Cache-Control': 'no-store',
      });
      const subscription = this.http.get(url, {
        headers,
        responseType: 'blob',
        reportProgress: true,
        observe: 'events',
        params,
      }).subscribe({
        next: (event) => {
          switch(event.type) {
            case HttpEventType.DownloadProgress:
              if(event.total) {
                const progress = Math.round(event.loaded / event.total * 100);
                sbRef.instance.progress = progress;
                sbRef.instance.mode = 'determinate';
                sbRef.instance.suffix = `${bytesToSize(event.loaded)} / ${bytesToSize(event.total)}`;
                sbRef.instance.title = determinateTitle;
              } else {
                sbRef.instance.mode = 'indeterminate';
                sbRef.instance.suffix = '';
                sbRef.instance.title = indeterminateTitle;
              }
              break;
            case HttpEventType.Response:
              observer.next(this.httpResponseToFile(event, fileName, fileType));
              observer.complete();
              break;
          }
        },
        error: (err) => {
          observer.error(err);
          sbRef.dismiss();
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
}

function getFileName(response: HttpResponse<Blob>): string | null {
  const disposition = response.headers.get('Content-Disposition');
  if (!disposition) {
    return null;
  }
  // RFC 5987 / UTF-8 filename*
  const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (utf8Match) {
    return decodeURIComponent(utf8Match[1]);
  }
  // Regular filename=
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/i);
  if (filenameMatch) {
    return filenameMatch[1];
  }
  return null;
}

interface GetFileOptions {
  params?: HttpParams | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;
  fileName?: string;
  fileType?: string;
  showSnackBar?: boolean;
  indeterminateTitle?: string;
}

interface GetFileWithProgressOptions extends Omit<GetFileOptions, 'showSnackBar'> {
  determinateTitle?: string;
}
