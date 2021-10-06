import pino from 'pino';
import Ajv from 'ajv';
import BookingService from './booking_service';
import Repositories from '../repositories/repositories';

class Services {
  public bookingService: BookingService;

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
    this.bookingService = new BookingService(
      repositories,
      logger,
      ajv,
      openHour,
      openMinute,
      closeHour,
      closeMinute,
      duration,
    );
  }
}

export default Services;
