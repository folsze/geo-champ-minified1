export class Location {
  public id: number;
  public name: string;
  public progress: number; // 0..7

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
    this.progress = 0;
  }
}
