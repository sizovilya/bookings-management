import { BookingModel } from '../../repositories/booking_repository';

class Database {
  public arr: Array<BookingModel>

  public capacity: number;

  constructor(capacity: number) {
    this.arr = new Array<BookingModel>();
    this.capacity = capacity;
  }
}

export default Database;
