import { DateTime } from 'luxon';
import Customer from './customer';
import Vehicle from './vehicle';

type Booking = {
  customer: Customer
  vehicle: Vehicle
  date: DateTime
  endDate: DateTime
}

export default Booking;
