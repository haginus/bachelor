import { CommitteeMember } from "../services/auth.service";

export const DOMAIN_TYPES = {
  bachelor: 'licență',
  master: 'master',
};

export const FUNDING_FORMS = {
  budget: 'buget',
  tax: 'taxă',
};

export const STUDY_FORMS = {
  if: 'Învățământ cu frecvență',
  ifr: 'Învățământ cu frecvență redusă',
  id: 'Învățământ la distanță',
};

export const USER_TYPES = {
  student: 'student',
  teacher: 'profesor',
  committee: 'comisie',
  admin: 'administrator',
  secretary: 'secretar',
};

export const PAPER_TYPES = {
  bachelor: 'licență',
  diploma: 'diplomă',
  master: 'disertație',
};

export const COMMITTEE_MEMBER_ROLE = {
  president: 'Președinte',
  secretary: 'Secretar',
  member: 'Membru',
} as const satisfies Record<CommitteeMember['role'], string>;
