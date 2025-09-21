import 'dotenv/config';
import app from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

const port = env.PORT;

app.listen(port, () => {
  logger.info({ port }, 'Polybright IMS API running');
});
