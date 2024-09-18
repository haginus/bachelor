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
