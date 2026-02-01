import { HttpClient, HttpContext, HttpDownloadProgressEvent, HttpEvent, HttpEventType, HttpHeaders, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { EMPTY, Observable, repeat, retry, Subscriber, timer } from "rxjs";
import { skipErrorToken } from "../interceptors/error.interceptor";

@Injectable({
  providedIn: 'any'
})
export class SseClient {
  constructor(private readonly http: HttpClient) {}

  request<T = string>(method: string, url: string, options?: SseOptions): Observable<MessageEvent<T>> {
    return new SseSubscriber<T>(this.http, method, url, options).events$;
  }

  get<T = string>(url: string, options?: SseOptions): Observable<MessageEvent<T>> {
    return this.request('GET', url, options);
  }

  post<T = string>(url: string, options?: SseOptions): Observable<MessageEvent<T>> {
    return this.request('POST', url, options);
  }
}

interface SseOptions {
  keepAlive?: boolean;
  reconnectDelay?: number;
  body?: any;
  headers?: HttpHeaders | { [header: string]: string | string[]; };
  context?: HttpContext;
  params?: HttpParams | { [param: string]: string | number | boolean | ReadonlyArray<string | number | boolean> };
  withCredentials?: boolean;
}

class SseSubscriber<T = string> {

  public events$: Observable<MessageEvent<T>>;
  private _observer: Subscriber<MessageEvent<T>>;
  private _unparsedText = '';
  private _lastLoaded = 0;

  constructor(
    private readonly http: HttpClient,
    private readonly method: string,
    private readonly url: string,
    private options: SseOptions = {},
  ) {
    const { keepAlive, reconnectDelay, ...requestHttpOptions } = options;
    options.keepAlive = keepAlive ?? true;
    options.reconnectDelay = reconnectDelay ?? 3000;
    this.events$ = new Observable<MessageEvent<T>>((observer) => {
      this._observer = observer;
      const context = new HttpContext();
      context.set(skipErrorToken, true);
      const httpOptions = {
        context,
        responseType: 'text',
        observe: 'events',
        reportProgress: true,
        ...requestHttpOptions,
      } as const;
      const subscription = this.http.request(this.method, this.url, httpOptions)
        .pipe(
          repeat({
            delay: () => this.options.keepAlive ? timer(this.options.reconnectDelay) : EMPTY,
          }),
          retry({
            delay: () => this.options.keepAlive ? timer(this.options.reconnectDelay) : EMPTY,
          })
        )
        .subscribe(event => this.parseStreamEvent(event));
      return () => subscription.unsubscribe();
    });
  }

  private parseStreamEvent(event: HttpEvent<string>) {
    if(event.type === HttpEventType.Sent) {
      this._lastLoaded = 0;
      this._unparsedText = '';
    } else if(this._isDownloadProgressEvent(event)) {
      const partialText = event.partialText || '';
      const newText = partialText.substring(this._lastLoaded);
      this._lastLoaded = partialText.length;
      this._unparsedText += newText;
      this._parseEventsFromUnparsedText();
    } else if(event.type === HttpEventType.Response) {
      this._parseEventsFromUnparsedText();
      this._observer.complete();
    }
  }

  private _parseEventsFromUnparsedText() {
    const boundaryIndex = this._unparsedText.indexOf('\n\n');
    if(boundaryIndex === -1) return;

    const rawEvent = this._unparsedText.substring(0, boundaryIndex).trim();
    this._unparsedText = this._unparsedText.substring(boundaryIndex + 2);
    this._parseRawEvent(rawEvent);
    this._parseEventsFromUnparsedText();
  }

  private _parseRawEvent(rawEvent: string) {
    const eventLines = rawEvent.split('\n');
    const event: { id?: string; data?: any; type?: string; } = {};
    for(const line of eventLines) {
      const colonIndex = line.indexOf(':');
      if(colonIndex === -1) continue;
      const field = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();
      if(field === 'data') {
        event.data = this._maybeParseJson(value);
      } else if(field === 'event') {
        event.type = value;
      } else if(field === 'id') {
        event.id = value;
      }
    }
    if(event.data !== undefined) {
      this._observer.next(new MessageEvent(event.type || 'message', { data: event.data, lastEventId: event.id }));
    }
  }

  private _maybeParseJson(data: string): any {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  private _isDownloadProgressEvent(event: HttpEvent<any>): event is HttpDownloadProgressEvent {
    return event.type === HttpEventType.DownloadProgress;
  }
}
