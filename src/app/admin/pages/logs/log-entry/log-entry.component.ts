import { DatePipe } from '@angular/common';
import { Component, EventEmitter, Input, Output, Pipe } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { LogName } from '../log-name.enum';
import { LogEntryResource } from '../types';
import { logEntryResourcesSpecs } from '../log-entry-resources-specs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

@Pipe({ name: 'resourceTooltip', standalone: true })
export class ResourceTooltipPipe {
  transform(resource: LogEntryResource): string {
    const idInsert = resource.resourceId !== resource.displayName ? ` (#${resource.resourceId})` : '';
    return `${resource.label}: ${resource.displayName}${idInsert}`;
  }
}

@Component({
  selector: 'app-log-entry',
  imports: [
    NgxJsonViewerModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTooltipModule,
    MatMenuModule,
    DatePipe,
    ResourceTooltipPipe,
  ],
  host: {
    '[class.expanded]': 'expanded',
  },
  templateUrl: './log-entry.component.html',
  styleUrl: './log-entry.component.scss'
})
export class LogEntryComponent {

  @Input({ required: true }) log: any;
  protected filteredLog: any;
  protected resources: LogEntryResource[] = [];
  protected severityResource: LogEntryResource;
  protected message: string = '';
  protected expanded: boolean = false;

  @Output() filterChanged = new EventEmitter<FilterChangeEvent>();

  ngOnChanges() {
    this.parseLog();
  }

  public toggle() {
    this.expanded = !this.expanded;
  }

  handleResourceClick(resource: LogEntryResource, event: MouseEvent) {
    event.stopPropagation();
    // Do something with the resource
  }

  private parseLog() {
    const generalAttributes = [
      'id',
      'name',
      'severity',
      'timestamp',
      'byUserId',
      'impersonatedByUserId',
      'byUser',
      'impersonatedByUser',
      'meta'
    ];
    let byLogAttributes: string[] = [];
    switch(this.log.name) {
      case LogName.UserCreated:
      case LogName.UserUpdated:
      case LogName.UserDeleted:
      case LogName.UserValidated:
        byLogAttributes = [
          'userId',
          'user'
        ];
        break;
      case LogName.UserExtraDataCreated:
      case LogName.UserExtraDataUpdated:
      case LogName.UserExtraDataDeleted:
        byLogAttributes = [
          'userId',
          'user',
          'userExtraDataId',
          'userExtraData',
        ];
        break;
      case LogName.SubmissionCreated:
      case LogName.SubmissionSubmitted:
      case LogName.SubmissionUnsubmitted:
      case LogName.WrittenExamGradeGiven:
      case LogName.WrittenExamGradeDisputed:
        byLogAttributes = [
          'userId',
          'user',
          'submissionId',
          'submission',
        ];
        break;
      case LogName.PaperCreated:
      case LogName.PaperUpdated:
      case LogName.PaperDeleted:
      case LogName.PaperValidated:
      case LogName.PaperInvalidated:
      case LogName.PaperCancelledValidation:
      case LogName.PaperAssigned:
      case LogName.PaperUnassigned:
      case LogName.PaperGraded:
        byLogAttributes = [
          'paperId',
          'paper',
        ];
        break;
      case LogName.DocumentCreated:
      case LogName.DocumentContentUpdated:
      case LogName.DocumentDeleted:
        byLogAttributes = [
          'paperId',
          'paper',
          'documentId',
          'document',
        ];
        break;
      case LogName.DocumentReuploadRequestCreated:
      case LogName.DocumentReuploadRequestDeleted:
        byLogAttributes = [
          'paperId',
          'paper',
          'documentReuploadRequestId',
          'documentReuploadRequest',
        ];
        break;
    }
    const attributes = [...generalAttributes, ...byLogAttributes];
    let filteredLog = {};
    for (const key of attributes) {
      filteredLog[key] = this.log[key];
    }
    this.filteredLog = filteredLog;
    const resourcesSpecs = attributes.map(key => logEntryResourcesSpecs[key]).filter(Boolean);
    this.resources = resourcesSpecs.map(spec => {
      const resourceId = this.log[spec.resourceIdField];
      const resource = this.log[spec.resourceField] || spec.defaultResource;
      return {
        resourceFilterField: spec.resourceIdField,
        resourceId,
        resource,
        label: spec.label,
        icon: spec.icon,
        displayName: resource ? spec.getDisplayName(resource) : `#${resourceId}`,
      }
    }).filter(resource => resource.resourceId || resource.resource);
    switch(this.log.name) {
      default:
        this.message = '';
    }
    this.severityResource = {
      resourceFilterField: 'severity',
      resourceId: this.log.severity,
      resource: this.log.severity,
      label: 'Severitate',
      icon: 'info',
      displayName: this.log.severity,
    };
  }
}

export interface FilterChangeEvent {
  resource: LogEntryResource;
  show: boolean;
}
