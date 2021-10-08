import pino from 'pino';
import { DateTime } from 'luxon';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import Database from '../lib/db';
import Repositories from '../repositories/repositories';
import Services from './services';
import Config from '../config';
import Customer from '../domain/customer';
import Vehicle from '../domain/vehicle';
import Booking from '../domain/booking';

let config: Config;
let logger: pino.Logger;
let db: Database;
let repositories: Repositories;
let services: Services;

beforeEach(() => {
  config = {
    dealership: {
      openTime: '09:00',
      closeTime: '17:00',
      capacity: 2,
    },
    booking: {
      duration: 2,
    },
  };
  logger = pino();
  const ajv = new Ajv();
  addFormats(ajv);
  db = new Database(config.dealership.capacity);
  repositories = new Repositories(db);
  const [openHour, openMinute] = config.dealership.openTime.split(':');
  const [closeHour, closeMinute] = config.dealership.closeTime.split(':');
  services = new Services(
    repositories,
    logger,
    ajv,
    parseInt(openHour, 10),
    parseInt(openMinute, 10),
    parseInt(closeHour, 10),
    parseInt(closeMinute, 10),
    config.booking.duration,
  );
});

describe('create booking: validation', () => {
  test('empty customer name', () => {
    const customer: Customer = {
      name: '',
      email: '',
      phoneNumber: '',
    };
    const vehicle: Vehicle = {
      make: '',
      model: '',
      vin: '4s3...',
    };
    const booking: Booking = {
      customer,
      vehicle,
      date: DateTime.now(),
      endDate: DateTime.now(),
    };
    expect(() => services.bookingService.create(booking)).toThrow(Error);
  });
  test('wrong email', () => {
    const customer: Customer = {
      name: 'John Doe',
      email: 'jd.email',
      phoneNumber: '',
    };
    const vehicle: Vehicle = {
      make: '',
      model: '',
      vin: '4s3...',
    };
    const booking: Booking = {
      customer,
      vehicle,
      date: DateTime.now().toUTC().toUTC(),
      endDate: DateTime.now().toUTC(),
    };
    expect(() => services.bookingService.create(booking)).toThrow(Error);
  });

  test('date outside of working hours', () => {
    const customer: Customer = {
      name: 'John Doe',
      email: 'johndoe@mail.com',
      phoneNumber: '+1979795443',
    };
    const vehicle: Vehicle = {
      make: 'Volvo',
      model: 'XC 60',
      vin: '11111111111111111',
    };
    const booking: Booking = {
      customer,
      vehicle,
      date: DateTime.now().toUTC().set({ hour: 18 }),
      endDate: DateTime.now().toUTC(),
    };
    expect(() => services.bookingService.create(booking)).toThrow('Booking is outside of working hours');
  });
});

describe('create booking: creating', () => {
  test('successfully created', () => {
    const customer: Customer = {
      name: 'John Doe',
      email: 'johndoe@mail.com',
      phoneNumber: '+1979795443',
    };
    const vehicle: Vehicle = {
      make: 'Volvo',
      model: 'XC 90',
      vin: '11111111111111111',
    };
    const booking: Booking = {
      customer,
      vehicle,
      date: DateTime.fromObject({
        hour: 9, minute: 0, second: 0, millisecond: 0,
      }, { zone: 'UTC' }),
      endDate: DateTime.now().toUTC(),
    };

    const secondBooking = { ...booking };
    secondBooking.date = DateTime.fromObject({
      hour: 12, minute: 30, second: 0, millisecond: 0,
    }, { zone: 'UTC' });

    const thirdBooking = { ...booking };
    thirdBooking.date = DateTime.fromObject({
      hour: 15, minute: 0, second: 0, millisecond: 0,
    }, { zone: 'UTC' });

    services.bookingService.create(booking);
    services.bookingService.create(secondBooking);
    expect(() => services.bookingService.create(thirdBooking)).not.toThrow();
  });
  test('capacity limit exceed', () => {
    const customer: Customer = {
      name: 'John Doe',
      email: 'johndoe@mail.com',
      phoneNumber: '+1979795443',
    };
    const vehicle: Vehicle = {
      make: 'Volvo',
      model: 'XC 90',
      vin: '11111111111111111',
    };
    const booking: Booking = {
      customer,
      vehicle,
      date: DateTime.fromObject({
        hour: 11, minute: 0, second: 0, millisecond: 0,
      }, { zone: 'UTC' }),
      endDate: DateTime.now().toUTC(),
    };

    const secondBooking = { ...booking };
    secondBooking.date = DateTime.fromObject({
      hour: 13, minute: 0, second: 0, millisecond: 0,
    }, { zone: 'UTC' });

    const thirdBooking = { ...booking };
    thirdBooking.date = DateTime.fromObject({
      hour: 11, minute: 15, second: 0, millisecond: 0,
    }, { zone: 'UTC' });

    services.bookingService.create(booking);
    services.bookingService.create(secondBooking);
    expect(() => services.bookingService.create(thirdBooking)).toThrow('Capacity limit exceed');
  });
});

describe('capacity management', () => {
  test('set capacity', () => {
    services.bookingService.setCapacity(10);
    expect(services.bookingService.getCapacity()).toBe(10);
  });
  test('wrong capacity', () => {
    expect(() => services.bookingService.setCapacity(-1)).toThrow('Capacity should be >= 1');
  });
});

describe('get bookings test', () => {
  test('create several bookings and get by date', () => {
    const customer: Customer = {
      name: 'John Doe',
      email: 'johndoe@mail.com',
      phoneNumber: '+1979795443',
    };
    const vehicle: Vehicle = {
      make: 'Volvo',
      model: 'XC 90',
      vin: '11111111111111111',
    };
    const booking: Booking = {
      customer,
      vehicle,
      date: DateTime.fromObject({
        hour: 9, minute: 0, second: 0, millisecond: 0,
      }, { zone: 'UTC' }),
      endDate: DateTime.now().toUTC(),
    };

    const secondBooking = { ...booking };
    secondBooking.date = DateTime.fromObject({
      hour: 12, minute: 30, second: 0, millisecond: 0,
    }, { zone: 'UTC' });

    const thirdBooking = { ...booking };
    thirdBooking.date = DateTime.fromObject({
      hour: 15, minute: 0, second: 0, millisecond: 0,
    }, { zone: 'UTC' });

    const fourthBooking = { ...booking };
    const yesterday = DateTime.fromObject({
      hour: 15, minute: 0, second: 0, millisecond: 0,
    }, { zone: 'UTC' }).minus({ days: 1 });
    fourthBooking.date = yesterday;

    services.bookingService.create(booking);
    services.bookingService.create(secondBooking);
    services.bookingService.create(thirdBooking);
    services.bookingService.create(fourthBooking);
    expect(services.bookingService.getBookingsByDate(DateTime.now().toUTC())).toHaveLength(3);
  });
  test('create several bookings and get by vin', () => {
    const vin = '11111111111111111';
    const customer: Customer = {
      name: 'John Doe',
      email: 'johndoe@mail.com',
      phoneNumber: '+1979795443',
    };
    const vehicle: Vehicle = {
      make: 'Volvo',
      model: 'XC 90',
      vin,
    };
    const booking: Booking = {
      customer,
      vehicle,
      date: DateTime.fromObject({
        hour: 9, minute: 0, second: 0, millisecond: 0,
      }, { zone: 'UTC' }),
      endDate: DateTime.now().toUTC(),
    };

    const secondBooking = JSON.parse(JSON.stringify(booking));
    secondBooking.vehicle.vin = '22222222222222222';
    secondBooking.date = DateTime.fromObject({
      hour: 9, minute: 0, second: 0, millisecond: 0,
    }, { zone: 'UTC' });
    secondBooking.endDate = DateTime.now().toUTC();

    services.bookingService.create(booking);
    services.bookingService.create(secondBooking);
    expect(services.bookingService.getBookingsByVIN(vin)).toHaveLength(1);
  });
});
