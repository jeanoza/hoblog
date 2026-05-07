export class ActivityEntity {
  readonly id: number;
  readonly title: string;
  readonly note: string | null;
  readonly date: Date;
  readonly createdAt: Date;
  readonly userId: number;
  readonly categoryId: number;

  constructor(data: {
    id: number;
    title: string;
    note?: string | null;
    date: Date;
    createdAt: Date;
    userId: number;
    categoryId: number;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.note = data.note ?? null;
    this.date = data.date;
    this.createdAt = data.createdAt;
    this.userId = data.userId;
    this.categoryId = data.categoryId;
  }
}
