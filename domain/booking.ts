import Customer from './customer';
import Vehicle from './vehicle';

type Booking = {
  customer: Customer
  vehicle: Vehicle
  date: Date
  endDate: Date
}

export default Booking;
