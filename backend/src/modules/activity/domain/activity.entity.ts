export class ActivityEntity {
  readonly id: number;
  readonly title: string;
  readonly note: string | null;
  readonly date: Date;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
  readonly userId: number;
  readonly userName: string;
  readonly categoryId: number;

  constructor(data: {
    id: number;
    title: string;
    note?: string | null;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    userId: number;
    userName: string;
    categoryId: number;
  }) {
    this.id = data.id;
    this.title = data.title;
    this.note = data.note ?? null;
    this.date = data.date;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt ?? null;
    this.userId = data.userId;
    this.userName = data.userName;
    this.categoryId = data.categoryId;
  }

  get isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
