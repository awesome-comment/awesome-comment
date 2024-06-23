#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises';
import { DOMParser } from '@xmldom/xmldom';
import { html2Markdown } from '@inkdropapp/html2markdown';

function clearContent(text) {
  return JSON.stringify(html2Markdown(text).trim());
}

const xml = await readFile('./tmp/disqus.xml', 'utf8');
const dom = new DOMParser().parseFromString(xml, 'text/xml');
const postMap = {};
const commentsHasParent = [];
for (let i = 0, len = dom.documentElement.childNodes.length; i < len; i++) {
  const el = dom.documentElement.childNodes[ i ];
  if (el.tagName !== 'post') continue;
  if (el.getAttribute('isDeleted') === 'true'
    || el.getAttribute('isSpam')) continue;
  const id = el.getAttribute('dsq:id');
  const parent_id = el.getElementsByTagName('parent')[ 0 ]?.getAttribute('dsq:id') || null;
  if (parent_id) {
    commentsHasParent.push(el);
  }
  postMap[ id ] = el;
}
const SQLs = [];
for (const child of commentsHasParent) {
  const parent_id = child.getElementsByTagName('parent')[ 0 ]?.getAttribute('dsq:id') || null;
  const parent = postMap[ parent_id ];
  const parentContent = clearContent(parent.getElementsByTagName('message')[ 0 ].textContent || '');
  const childContent = clearContent(child.getElementsByTagName('message')[ 0 ].textContent || '');
  const sql = `UPDATE ac_comment
SET parent_id=(
    SELECT id
    FROM ac_comment
    WHERE content = ${parentContent}
)
WHERE id=(
    SELECT id
    FROM ac_comment
    WHERE content = ${childContent}
);`;
  SQLs.push(sql);
}
await writeFile('./tmp/disqus.sql', SQLs.join('\n'));
