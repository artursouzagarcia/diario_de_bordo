import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env');
if (!fs.existsSync(envPath)) {
  const example = path.resolve(process.cwd(), '.env.example');
  if (fs.existsSync(example)) {
    fs.copyFileSync(example, envPath);
  }
}

dotenv.config({ path: envPath });

// Ensure upload dir exists
const uploadDir = process.env.UPLOAD_DIR || './uploads';
const absUpload = path.resolve(process.cwd(), uploadDir);
if (!fs.existsSync(absUpload)) {
  fs.mkdirSync(absUpload, { recursive: true });
}
