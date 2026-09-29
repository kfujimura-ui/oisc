import fs from 'node:fs';

const file = process.argv[2] || 'content/news/latest.json';
const fail = message => {
  console.error(`News data invalid: ${message}`);
  process.exitCode = 1;
};

let data;
try {
  data = JSON.parse(fs.readFileSync(file, 'utf8'));
} catch (error) {
  fail(`${file} is not valid JSON (${error.message})`);
  process.exit();
}

const x = data?.x || {};
const y = data?.youtube || {};
const tags = Array.isArray(x.tags) ? x.tags : [];
const xUrl = /^https:\/\/x\.com\/OISC_official\/status\/\d+$/.test(String(x.url || ''));
const english = /^[\x00-\x7F]+$/.test(String(x.text || '')) && /[A-Za-z]/.test(String(x.text || ''));
const date = /^\d{4}-\d{2}-\d{2}$/.test(String(x.publishedAt || ''));
const tagsOk = tags.length > 0 && tags.every(tag => /^#[A-Za-z0-9]+$/.test(String(tag)));
const videoId = /^[A-Za-z0-9_-]{11}$/.test(String(y.videoId || ''));
const videoUrl = String(y.url || '') === `https://youtu.be/${y.videoId}`;
const title = typeof y.title === 'string' && y.title.trim().length > 0;

if (!xUrl) fail('x.url must be an OISC_official status URL');
if (!english) fail('x.text must be non-empty English/ASCII text');
if (!date) fail('x.publishedAt must use YYYY-MM-DD');
if (!tagsOk) fail('x.tags must contain one or more #ASCII tags');
if (!videoId) fail('youtube.videoId must be an 11-character YouTube ID');
if (!videoUrl) fail('youtube.url must match youtube.videoId');
if (!title) fail('youtube.title must be non-empty');

if (process.exitCode) process.exit();
console.log(`News data valid: ${file}`);
