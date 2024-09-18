export interface LogEntryResourcesSpec {
  resourceIdField: string;
  resourceField: string;
  label: string;
  icon: string;
  getDisplayName: (resource: any) => string;
  defaultResource?: any;
}

export interface LogEntryResource {
  resourceFilterField: string;
  resourceId: string;
  resource: any;
  label: string;
  icon: string;
  displayName: string;
}
