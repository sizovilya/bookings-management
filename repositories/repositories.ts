import BookingRepository from './booking_repository';
import Database from '../lib/db';

class Repositories {
  public booking: BookingRepository

  constructor(db: Database) {
    this.booking = new BookingRepository(db);
  }
}

export default Repositories;
