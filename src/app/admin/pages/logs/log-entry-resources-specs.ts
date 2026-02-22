import { DocumentReuploadRequest } from "../../../lib/types";
import { LogEntryResourcesSpec } from "./types";

const _logEntryResourcesSpecs: LogEntryResourcesSpec[] = [
  {
    resourceIdField: 'name',
    resourceField: 'name',
    label: 'Nume log',
    icon: 'label',
    getDisplayName: (resource) => resource
  },
  {
    resourceIdField: 'byUserId',
    resourceField: 'byUser',
    label: 'Utilizator',
    icon: 'account_circle',
    getDisplayName: (resource) => `${resource.firstName} ${resource.lastName}`,
    defaultResource: {
      id: null,
      firstName: '[SISTEM]',
      lastName: '',
    }
  },
  {
    resourceIdField: 'impersonatedByUserId',
    resourceField: 'impersonatedByUser',
    label: 'Impersonator',
    icon: 'supervised_user_circle',
    getDisplayName: (resource) => `${resource.firstName} ${resource.lastName}`
  },
  {
    resourceIdField: 'userId',
    resourceField: 'user',
    label: 'Utilizator afectat',
    icon: 'person',
    getDisplayName: (resource) => `${resource.firstName} ${resource.lastName}`
  },
  {
    resourceIdField: 'userExtraDataId',
    resourceField: 'userExtraData',
    label: 'Date suplimentare utilizator',
    icon: 'school',
    getDisplayName: (resource) => `#${resource.userId}`
  },
  {
    resourceIdField: 'submissionId',
    resourceField: 'submission',
    label: 'Înscriere',
    icon: 'send',
    getDisplayName: (resource) => `${resource.student.firstName} ${resource.student.lastName}`
  },
  {
    resourceIdField: 'paperId',
    resourceField: 'paper',
    label: 'Lucrare',
    icon: 'description',
    getDisplayName: (resource) => resource.title,
  },
  {
    resourceIdField: 'documentId',
    resourceField: 'document',
    label: 'Document',
    icon: 'insert_drive_file',
    getDisplayName: (resource) => `${resource.name}:${resource.type}`,
  },
  {
    resourceIdField: 'documentReuploadRequestId',
    resourceField: 'documentReuploadRequest',
    label: 'Cerere reîncărcare document',
    icon: 'sync',
    getDisplayName: (resource: DocumentReuploadRequest) => `${resource.documentName}`
  }
];

export const logEntryResourcesSpecs = _logEntryResourcesSpecs.reduce((acc, spec) => {
  acc[spec.resourceIdField] = spec;
  return acc;
}, {} as Record<string, LogEntryResourcesSpec>);
