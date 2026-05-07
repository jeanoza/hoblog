export class CategoryEntity {
  readonly id: number;
  readonly name: string;
  readonly userId: number;

  constructor(data: { id: number; name: string; userId: number }) {
    this.id = data.id;
    this.name = data.name;
    this.userId = data.userId;
  }
}
