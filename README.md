# bookings-management

### How to run
``npm i``  to install dependencies  
``npm start``  to run project  
``npm run test ``  to run tests  

### How to use
#### Set dealership capacity:
Request:
```
mutation setCapacity{
  setCapacity(capacity: 5) {
    capacity
  }
}
```

#### Get dealership capacity:
Request:
```
query getCapacity {
  getCapacity {
    capacity
  }
}
```

#### Create booking:
Request:
```
mutation createBooking($booking: BookingInput!) {
  createBooking(booking: $booking)
}

// Query variables
{
  "booking": {
    "customer": {
      "name": "John Doe",
      "email": "jd@mail.com",
      "phoneNumber": "+1 4758947589"
    },
    "vehicle": {
      "make": "Volvo",
      "model": "XC 60",
      "vin": "12345678912345670"
    },
    "date": "2021-10-08T11:09:29.289Z"
  }
}
```

#### Get bookings by date:
Request:
```
query getBookingsByDay {
  bookingsByDay(date: "2021-10-08T00:00:00.000Z") {
    date
    endDate
    vehicle {
      vin
      make
      model
    }
    customer{
      name
      email
      phoneNumber
    }
  }
}
```

#### Get bookings by VIN number:
Request:
```
query getBookingsByVin {
  bookingsByVin(vin: "12345678912345670") {
    date
    endDate
    vehicle {
      vin
      make
      model
    }
    customer{
      name
      email
      phoneNumber
    }
  }
}
```
