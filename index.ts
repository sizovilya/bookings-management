import pino from 'pino';
import YAML from 'yaml';
import * as fs from 'fs';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import Database from './lib/db';
import Repositories from './repositories/repositories';
import Services from './services/services';
import GraphQLServer from './lib/graphql/server';
import Config from './config';

async function main() {
  const file = fs.readFileSync('./configs/config.yaml', 'utf8');
  const config: Config = YAML.parse(file);
  const logger = pino();
  const ajv = new Ajv();
  addFormats(ajv);
  const db = new Database(config.dealership.capacity);
  const repositories = new Repositories(db);
  const [openHour, openMinute] = config.dealership.openTime.split(':');
  const [closeHour, closeMinute] = config.dealership.closeTime.split(':');
  const services = new Services(
    repositories,
    logger,
    ajv,
    parseInt(openHour, 10),
    parseInt(openMinute, 10),
    parseInt(closeHour, 10),
    parseInt(closeMinute, 10),
    config.booking.duration,
  );
  const server = new GraphQLServer(services);
  await server.run();
}

main()
  // eslint-disable-next-line no-console
  .catch((err) => console.error(err));
