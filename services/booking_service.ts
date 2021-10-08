/* eslint-disable no-param-reassign */
import pino from 'pino';
import { JTDDataType } from 'ajv/dist/jtd';
import Ajv, { ValidateFunction } from 'ajv';
import { DateTime } from 'luxon';
import Repositories from '../repositories/repositories';
import Booking from '../domain/booking';

const createBookingValidationSchema = {
  type: 'object',
  properties: {
    customer: {
      type: 'object',
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 50 },
        email: { type: 'string', format: 'email' },
        phoneNumber: { type: 'string', minLength: 1, maxLength: 50 },
      },
    },
    vehicle: {
      type: 'object',
      properties: {
        make: { type: 'string', minLength: 1, maxLength: 50 },
        model: { type: 'string', minLength: 1, maxLength: 50 },
        VIN: { type: 'string', minLength: 17, maxLength: 17 },
      },
    },
    date: { type: 'object', format: 'date' },
  },
  additionalProperties: true,
};

type CreateBookingValidation = JTDDataType<typeof createBookingValidationSchema>;

class BookingService {
  private repositories: Repositories;

  private logger: pino.Logger;

  private ajv: Ajv;

  private readonly openHour: number;

  private readonly openMinute: number;

  private readonly closeHour: number;

  private readonly closeMinute: number;

  private readonly duration: number;

  private readonly validator: ValidateFunction<CreateBookingValidation>;

  constructor(
    repositories: Repositories,
    logger: pino.Logger,
    ajv: Ajv,
    openHour: number,
    openMinute: number,
    closeHour: number,
    closeMinute: number,
    duration: number,
  ) {
    this.repositories = repositories;
    this.logger = logger;
    this.ajv = ajv;
    this.openHour = openHour;
    this.openMinute = openMinute;
    this.closeHour = closeHour;
    this.closeMinute = closeMinute;
    this.duration = duration;

    this.validator = ajv.compile<CreateBookingValidation>(createBookingValidationSchema);
  }

  public create(
    booking: Booking,
  ): void {
    this.logger.info('create booking: %o', booking);

    const valid = this.validator(booking);
    if (!valid) {
      if (this.validator.errors) {
        throw new Error(`${this.validator.errors[0].instancePath} ${this.validator.errors[0].message}`);
      }
    }

    const { date } = booking;
    const endDate = DateTime.fromObject(date.toObject(), { zone: 'UTC' }).plus({ hours: this.duration });

    const dealershipOpenDate = DateTime.fromObject(date.toObject(), { zone: 'UTC' }).set({
      hour: this.openHour, minute: this.openMinute, second: 0, millisecond: 0,
    });
    const dealershipCloseDate = DateTime.fromObject(date.toObject(), { zone: 'UTC' }).set({
      hour: this.closeHour, minute: this.closeMinute, second: 0, millisecond: 0,
    });
    if (date < dealershipOpenDate || endDate > dealershipCloseDate) {
      throw new Error('Booking is outside of working hours');
    }

    booking.endDate = endDate;
    const capacity = this.repositories.booking.getCapacity();
    const recentBookings = this.repositories.booking.getBookingIntersections(date, endDate);

    if (recentBookings.length === capacity) {
      throw new Error('Capacity limit exceed');
    }
    this.repositories.booking.createBooking(booking);
  }

  public setCapacity(capacity: number): void {
    this.logger.info('set capacity: %d', capacity);
    if (capacity < 1) {
      throw new Error('Capacity should be >= 1');
    }

    this.repositories.booking.setCapacity(capacity);
  }

  public getCapacity(): number {
    return this.repositories.booking.getCapacity();
  }

  public getBookingsByDate(date: DateTime): Array<Booking> {
    const startDate = DateTime.fromObject(date.toObject(), { zone: 'UTC' }).set({
      hour: this.openHour, minute: this.openMinute, second: 0, millisecond: 0,
    });
    const endDate = DateTime.fromObject(date.toObject(), { zone: 'UTC' }).set({
      hour: this.closeHour, minute: this.closeMinute, second: 0, millisecond: 0,
    });
    return this.repositories.booking.getBookingsByDate(startDate, endDate);
  }

  public getBookingsByVIN(vin: string): Array<Booking> {
    if (vin.length !== 17) {
      throw new Error('VIN has wrong format');
    }
    return this.repositories.booking.getBookingsByVIN(vin);
  }
}

export default BookingService;
