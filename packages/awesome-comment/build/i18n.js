import { writeFile } from 'node:fs/promises';

const response = await fetch('https://qe-editor.arealme.com/-/output/comment.arealme.com');
const i18n = await response.json();
i18n[ 'zh-CN' ] = i18n.cn;
delete i18n.cn;
await writeFile('i18n.json', JSON.stringify(i18n, null, 2), 'utf8');
