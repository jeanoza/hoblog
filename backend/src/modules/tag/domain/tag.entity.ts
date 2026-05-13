export class TagEntity {
  readonly id: number;
  readonly name: string;
  readonly createdAt: Date;

  constructor(data: { id: number; name: string; createdAt: Date }) {
    this.id = data.id;
    this.name = data.name;
    this.createdAt = data.createdAt;
  }
}
