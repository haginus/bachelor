import { CivilState, CommitteeMemberRole } from "./types";

export const DEFAULT_TITLE = $localize`Finalizare studii`;

export const DOMAIN_TYPES = {
  bachelor: $localize`licență`,
  master: $localize`master`,
};

export const FUNDING_FORMS = {
  budget: $localize`buget`,
  tax: $localize`taxă`,
};

export const STUDY_FORMS = {
  if: $localize`Învățământ cu frecvență`,
  ifr: $localize`Învățământ cu frecvență redusă`,
  id: $localize`Învățământ la distanță`,
};

export const USER_TYPES = {
  student: $localize`student`,
  teacher: $localize`profesor`,
  committee: $localize`comisie`,
  admin: $localize`administrator`,
  secretary: $localize`secretar`,
};

export const PAPER_TYPES = {
  bachelor: $localize`licență`,
  diploma: $localize`diplomă`,
  master: $localize`disertație`,
};

export const CIVIL_STATE = {
  not_married: $localize`Necăsătorit(ă)`,
  married: $localize`Căsătorit(ă)`,
  divorced: $localize`Divorțat(ă)`,
  widow: $localize`Văduv(ă)`,
  re_married: $localize`Recăsătorit(ă)`,
} as const satisfies Record<CivilState, string>;

export const COMMITTEE_MEMBER_ROLE = {
  president: $localize`Președinte`,
  secretary: $localize`Secretar`,
  member: $localize`Membru`,
} as const satisfies Record<CommitteeMemberRole, string>;
