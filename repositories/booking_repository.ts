/* eslint-disable camelcase */
import Database from '../lib/db';
import Booking from '../domain/booking';

type BookingModel = {
  make: string
  model: string
  vin: string
  name: string
  email: string
  phone_number: string
  start_date: Date
  end_date: Date
}

class BookingRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  public createBooking(booking: Booking): void {
    const bm: BookingModel = {
      make: booking.vehicle.make,
      model: booking.vehicle.model,
      vin: booking.vehicle.vin,
      name: booking.customer.name,
      email: booking.customer.email,
      phone_number: booking.customer.phoneNumber,
      start_date: booking.date,
      end_date: booking.endDate,
    };
    this.db.arr.push(bm);
  }

  public getBookingIntersections(startDate: Date, endDate: Date): Array<Booking> {
    const bms = this.db
      .arr
      .filter(
        (b) => (b.start_date >= startDate && b.start_date <= endDate)
          || (b.end_date >= startDate && b.end_date <= endDate),
      );

    return bms.map((i) => {
      const b: Booking = {
        date: i.start_date,
        endDate: i.end_date,
        customer: {
          name: i.name,
          email: i.email,
          phoneNumber: i.phone_number,
        },
        vehicle: {
          make: i.make,
          model: i.model,
          vin: i.vin,
        },
      };
      return b;
    });
  }

  public getBookingsByDate(startDate: Date, endDate: Date): Array<Booking> {
    const bms = this.db
      .arr
      .filter((b) => b.start_date >= startDate && b.end_date <= endDate);

    return bms.map((i) => {
      const b: Booking = {
        date: i.start_date,
        endDate: i.end_date,
        customer: {
          name: i.name,
          email: i.email,
          phoneNumber: i.phone_number,
        },
        vehicle: {
          make: i.make,
          model: i.model,
          vin: i.vin,
        },
      };
      return b;
    });
  }

  public getBookingsByVIN(vin: string): Array<Booking> {
    const bms = this.db
      .arr
      .filter((b) => b.vin === vin);

    return bms.map((i) => {
      const b: Booking = {
        date: i.start_date,
        endDate: i.end_date,
        customer: {
          name: i.name,
          email: i.email,
          phoneNumber: i.phone_number,
        },
        vehicle: {
          make: i.make,
          model: i.model,
          vin: i.vin,
        },
      };
      return b;
    });
  }

  public getCapacity(): number {
    return this.db.capacity;
  }

  public setCapacity(capacity: number): void {
    this.db.capacity = capacity;
  }
}

export default BookingRepository;
export {
  BookingModel,
};
