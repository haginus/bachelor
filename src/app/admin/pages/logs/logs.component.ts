import { Component, ViewChild } from '@angular/core';
import { LogsQuery, LogsService } from '../../../services/logs.service';
import { FilterChangeEvent, LogEntryComponent } from './log-entry/log-entry.component';
import { CodeEditorComponent, CodeEditorModule, CodeModel } from '@ngstack/code-editor';
import { logFilterSchema } from './log-filter.schema';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [
    LogEntryComponent,
    CodeEditorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './logs.component.html',
  styleUrl: './logs.component.scss',
})
export class LogsComponent {

  constructor(
    private readonly logsService: LogsService,
  ) {
    this.queryLogs();
  }

  logsCount = 0;
  logs: any[] = [];
  isLoadingResults = false;
  private defaultLogsQuery = {
    pagination: {
      limit: 20,
    },
    filters: {}
  }

  logsQuery: LogsQuery = JSON.parse(JSON.stringify(this.defaultLogsQuery));
  invalidQuery = false;

  @ViewChild(CodeEditorComponent, { static: true }) codeEditor: CodeEditorComponent;

  ngOnInit() {
    setInterval(() => {
      this.codeEditor.onResize();
    }, 1000);
  }

  queryLogs(resetOffset = true) {
    if(!this.logsQuery) return;
    this.isLoadingResults = true;
    const logsQuery: LogsQuery = JSON.parse(JSON.stringify(this.logsQuery));
    logsQuery.pagination = logsQuery.pagination || { limit: 20 };
    logsQuery.pagination.offset = resetOffset ? 0 : this.logs.length;
    this.logsService.findAll(logsQuery).subscribe(logs => {
      this.logs = resetOffset ? logs.rows : [...this.logs, ...logs.rows];
      this.logsCount = logs.count;
      this.isLoadingResults = false;
    });
  }

  resetFilters() {
    this.logsQuery = JSON.parse(JSON.stringify(this.defaultLogsQuery));
    this.codeEditor.editor.setValue(JSON.stringify(this.logsQuery, null, 2));
    this.queryLogs();
  }

  handleFilterChange(event: FilterChangeEvent) {
    const logs = this.logsQuery || JSON.parse(JSON.stringify(this.defaultLogsQuery));
    logs.filters = logs.filters || {};
    const resourceId = event.resource.resourceFilterField;
    logs.filters[resourceId] = logs.filters[resourceId] || {};
    const pushIfNotExists = (arr: any[], value: any) => {
      if(arr.indexOf(value) === -1) {
        arr.push(value);
      }
    }
    if(event.show) {
      logs.filters[resourceId].matching = logs.filters[resourceId].matching || [];
      pushIfNotExists(logs.filters[resourceId].matching, event.resource.resourceId);
      delete logs.filters[resourceId].notMatching;
    } else {
      logs.filters[resourceId].notMatching = logs.filters[resourceId].notMatching || [];
      pushIfNotExists(logs.filters[resourceId].notMatching, event.resource.resourceId);
      delete logs.filters[resourceId].matching;
    }
    this.logsQuery = logs;
    this.codeEditor.editor.setValue(JSON.stringify(this.logsQuery, null, 2));
    this.queryLogs();
  }

  model: CodeModel = {
    language: 'json',
    uri: 'main.json',
    value: JSON.stringify(this.logsQuery, null, 2),
    schemas: [{ uri: '$schema', schema: logFilterSchema }]
  };

  options: CodeEditorComponent['options'] = {
    tabSize: 2,
    scrollBeyondLastLine: false,
  };

  handleValueChange(value: string) {
    const monaco = window['monaco'];
    setTimeout(() => {
      this.invalidQuery = monaco.editor.getModelMarkers({ owner: "json" }).length > 0;
    }, 1000);
    try {
      this.logsQuery = JSON.parse(value);
    } catch (e) {
      this.logsQuery = null;
    }
  }

}
