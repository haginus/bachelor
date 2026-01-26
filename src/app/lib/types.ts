export type StudyForm = 'if' | 'ifr' | 'id';
export type DomainType = 'bachelor' | 'master';
export type PaperType = 'bachelor' | 'diploma' | 'master';
export type FundingForm = 'budget' | 'tax';

export interface Specialization {
  id: number;
  name: string;
  studyYears: number;
  studyForm: StudyForm;
  studentCount?: number;
  domain?: Domain;
}

export interface Domain {
  id: number;
  name: string;
  type: DomainType;
  paperType: PaperType;
  specializations: Specialization[];
}

export interface Profile {
  bio?: string;
  website?: string;
  picture?: string;
}

export type UserType = 'admin' | 'secretary' | 'teacher' | 'student';

export interface User {
  id: number;
  type: UserType;
  email: string;
  validated: boolean;
  firstName: string;
  lastName: string;
  title?: string;
  fullName: string;
  CNP: string;
  isImpersonated?: boolean;
  profile?: Profile;
}

export interface Admin extends User {
  type: 'admin';
}

export interface Secretary extends User {
  type: 'secretary';
}

export interface Teacher extends User {
  type: 'teacher';
}

export interface Student extends User {
  type: 'student';
  group: string;
  promotion: string;
  identificationCode: string;
  matriculationYear: number;
  fundingForm: FundingForm;
  generalAverage: number;
  specialization: Specialization;
}

export function isStudent(user: User): user is Student {
  return user.type === 'student';
}
export interface Address {
  county: string;
  locality: string;
  street: string;
  streetNumber: string;
  building?: string;
  stair?: string;
  floor?: string;
  apartment?: string;
}

export type CivilState = 'not_married' | 'married' | 'divorced' | 'widow' | 're_married';

export interface UserExtraData {
  birthLastName: string;
  parentInitial: string;
  fatherName: string;
  motherName: string;
  civilState: CivilState;
  dateOfBirth: Date | any;
  citizenship: string;
  ethnicity: string;
  placeOfBirthCountry: string;
  placeOfBirthCounty: string;
  placeOfBirthLocality: string;
  landline: string;
  mobilePhone: string;
  personalEmail: string;
  address: Address;
}

export interface Topic {
  id: number;
  name: string;
}

export interface Offer {
  id: number;
  description: string;
  limit: number;
  pendingApplicationCount: number;
  takenSeats: number;
  teacher: Teacher;
  domain: Domain;
  topics: Topic[];
  applications: Application[];
}

export interface TeacherOfferDto extends Teacher {
  offers: (Offer & { hasApplied: boolean })[];
}

export interface Application {
  id: number;
  title: string;
  description: string;
  usedTechnologies: string;
  accepted: boolean | null;
  offer: Offer;
  student: Student;
}

export interface Paper {
  id: number;
  title: string;
  description: string;
  type: PaperType;
  isValid: boolean;
  /** @deprecated */
  submitted: boolean;
  scheduledGrading: string;
  studentId: number;
  teacherId: number;
  student: Student;
  teacher: Teacher;
  documents: Document[];
  requiredDocuments: RequiredDocument[];
  gradeAverage: number | null;
  committee: any;
  topics: Topic[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export type DocumentType = 'generated' | 'signed' | 'copy';
export type DocumentUploadPerspective = 'student' | 'teacher' | 'committee';
export type DocumentCategory = 'secretary_files' | 'paper_files';

export interface RequiredDocumentTypes {
  generated?: boolean;
  signed?: boolean;
  copy?: boolean;
}

export interface RequiredDocument {
  name: string;
  title: string;
  category: DocumentCategory;
  types: RequiredDocumentTypes;
  acceptedMimeTypes: string;
  acceptedExtensions: string[];
  uploadBy: DocumentUploadPerspective;
  uploadInstructions?: string;
}

export interface Document {
  id: number;
  name: string;
  category: string;
  type: DocumentType;
  mimeType: string;
  meta: Record<string, any>;
  uploadedById: number | null;
  uploadedBy: User | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface DocumentReuploadRequest {
  id: number;
  paperId: number;
  documentName: string;
  deadline: string;
  comment: string;
  createdAt: string;
}

export interface Signature {
  id: number;
  userId: number;
  sample: string;
  createdAt: string;
}

export type CommitteeMemberRole = 'president' | 'secretary' | 'member';

export interface CommitteeMember {
  teacherId: number;
  teacher: Teacher;
  role: CommitteeMemberRole;
}

export interface CommitteeActivityDay {
  location: string;
  startTime: string;
}
export interface Committee {
  id: number;
  name: string;
  members: CommitteeMember[];
  domains: Domain[];
  activityDays: CommitteeActivityDay[];
  papers: Paper[];
}

export interface Paginated<T> {
  count: number;
  rows: T[];
}
