import { writeFile } from 'node:fs/promises';

const response = await fetch(process.env.I18N_SOURCE_ENDPOINT);
const i18n = await response.json();
await writeFile('i18n.json', JSON.stringify(i18n, null, 2), 'utf8');
