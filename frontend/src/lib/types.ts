export interface Category {
  id: number;
  name: string;
  userId: number;
}

export interface Activity {
  id: number;
  title: string;
  note: string | null;
  date: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
  categoryId: number;
}

export interface Photo {
  id: number;
  signedUrl: string;
  order: number;
  activityId: number;
}

export interface Tag {
  id: number;
  name: string;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}
