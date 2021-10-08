import { buildSchema } from 'graphql';
import { DateTime } from 'luxon';
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import Services from '../../services/services';
import Booking from '../../domain/booking';

class GraphQLServer {
  private services: Services;

  constructor(services: Services) {
    this.services = services;
  }

  public async run() {
    const schema = buildSchema(`
        type Query {
          bookingsByDay(date: String!): [Booking]
          bookingsByVin(vin: String!): [Booking]
          getCapacity: Capacity
        },
        type Mutation {
          setCapacity(capacity: Int!): Capacity
          createBooking(booking: BookingInput!): Boolean
        },
        type Capacity {
          capacity: Int!
        },
        type Vehicle {
          make: String!
          model: String!
          vin: String!
        },
        type Customer {
          name: String!
          email: String!
          phoneNumber: String!
        },
        type Booking {
           customer: Customer!
           vehicle: Vehicle!
           date: String!
           endDate: String!
         },
        input VehicleInput {
          make: String!
          model: String!
          vin: String!
        },
        input CustomerInput {
          name: String!
          email: String!
          phoneNumber: String!
        },
        input BookingInput {
           customer: CustomerInput!
           vehicle: VehicleInput!
           date: String!
         },
      `);

    const root = {
      bookingsByDay: (args) => {
        const date = DateTime.fromISO(args.date, { zone: 'UTC' });
        const bookings = this.services.bookingService.getBookingsByDate(date);
        return bookings.map((b) => ({
          date: b.date.toJSDate().toISOString(),
          endDate: b.endDate.toJSDate().toISOString(),
          vehicle: b.vehicle,
          customer: b.customer,
        }));
      },
      bookingsByVin: (args) => {
        const bookings = this.services.bookingService.getBookingsByVIN(args.vin);
        return bookings.map((b) => ({
          date: b.date.toJSDate().toISOString(),
          endDate: b.endDate.toJSDate().toISOString(),
          vehicle: b.vehicle,
          customer: b.customer,
        }));
      },
      getCapacity: () => ({
        capacity: this.services.bookingService.getCapacity(),
      }),
      createBooking: (args) => {
        const date = DateTime.fromISO(args.booking.date, { zone: 'UTC' });
        const booking: Booking = {
          date,
          vehicle: {
            make: args.booking.vehicle.make,
            model: args.booking.vehicle.model,
            vin: args.booking.vehicle.vin,
          },
          customer: {
            name: args.booking.customer.name,
            email: args.booking.customer.email,
            phoneNumber: args.booking.customer.phoneNumber,
          },
          endDate: DateTime.now().toUTC(),
        };
        this.services.bookingService.create(booking);
        return true;
      },
      setCapacity: (args) => {
        this.services.bookingService.setCapacity(args.capacity);
        return {
          capacity: this.services.bookingService.getCapacity(),
        };
      },
    };

    const app = express();
    app.use('/graphql', graphqlHTTP({
      schema,
      rootValue: root,
      graphiql: true,
    }));
    app.listen(4000);
    console.log('Running a GraphQL API server at http://localhost:4000/graphql');
  }
}

export default GraphQLServer;
