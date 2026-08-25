import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Loads the product catalog from the JSON file.
 * @returns {Array} Array of product objects
 */
export function loadCatalog() {
  const catalogPath = path.join(__dirname, '..', 'catalog.json');
  return JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
}
