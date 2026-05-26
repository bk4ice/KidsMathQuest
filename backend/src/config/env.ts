import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

const rootEnvPath = path.resolve(__dirname, '../../../.env');

if (fs.existsSync(rootEnvPath)) {
  dotenv.config({ path: rootEnvPath });
}
