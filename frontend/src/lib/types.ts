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
  userId: number;
  categoryId: number;
}

export interface Photo {
  id: number;
  url: string;
  order: number;
  activityId: number;
}

export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: string;
}
