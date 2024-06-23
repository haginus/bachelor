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
    getDisplayName: (resource) => `${resource.firstName} ${resource.lastName}`
  },
  {
    resourceIdField: 'impersonatedByUserId',
    resourceField: 'impersonatedByUser',
    label: 'Impersonator',
    icon: 'supervised_user_circle',
    getDisplayName: (resource) => `${resource.firstName} ${resource.lastName}`
  },
  {
    resourceIdField: 'paperId',
    resourceField: 'paper',
    label: 'Lucrare',
    icon: 'description',
    getDisplayName: (resource) => resource.title,
  }
];

export const logEntryResourcesSpecs = _logEntryResourcesSpecs.reduce((acc, spec) => {
  acc[spec.resourceIdField] = spec;
  return acc;
}, {} as Record<string, LogEntryResourcesSpec>);
