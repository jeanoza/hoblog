export class PhotoEntity {
  readonly id: number;
  readonly url: string;
  readonly order: number;
  readonly createdAt: Date;
  readonly activityId: number;

  constructor(data: {
    id: number;
    url: string;
    order: number;
    createdAt: Date;
    activityId: number;
  }) {
    this.id = data.id;
    this.url = data.url;
    this.order = data.order;
    this.createdAt = data.createdAt;
    this.activityId = data.activityId;
  }
}
