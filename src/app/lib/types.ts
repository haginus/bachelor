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
  profile: Profile;
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

export interface Paginated<T> {
  count: number;
  rows: T[];
}
