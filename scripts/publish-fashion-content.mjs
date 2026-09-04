import { readFile } from 'node:fs/promises';
import { basename, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';

const api = process.env.FASHION_API_URL ?? 'http://127.0.0.1:4000/api';
const root = resolve(import.meta.dirname, '..');
let email = process.env.FASHION_ADMIN_EMAIL;
let password = process.env.FASHION_ADMIN_PASSWORD;

if (!email || !password) {
  const prompt = createInterface({ input: stdin, output: stdout });
  email = email || (await prompt.question('Admin email: '));
  password = password || (await prompt.question('Admin password: '));
  prompt.close();
}

const loginResponse = await fetch(`${api}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

if (!loginResponse.ok) throw new Error(`Admin login failed: ${loginResponse.status}`);
const { accessToken } = await loginResponse.json();
const auth = { Authorization: `Bearer ${accessToken}` };

async function upload(filename) {
  const path = resolve(root, 'public/fashion', filename);
  const bytes = await readFile(path);
  const form = new FormData();
  form.append('file', new Blob([bytes], { type: 'image/png' }), basename(path));
  const response = await fetch(`${api}/uploads`, { method: 'POST', headers: auth, body: form });
  if (!response.ok) throw new Error(`Upload failed for ${filename}: ${response.status} ${await response.text()}`);
  return (await response.json()).url;
}

const filenames = [
  'summer-essentials.png',
  'workwear-refresh.png',
  'accessories-elevate.png',
  'real-style-stories.png',
  'nyfw-top-shows.png',
  'floral-maxi-dress.png',
  'linen-blazer.png',
  'ribbed-tank-top.png',
  'leather-shoulder-bag.png',
  'strappy-heeled-sandal.png',
  'coquette-summer.png',
  'beauty-bundle.png',
];

const urls = Object.fromEntries(
  await Promise.all(filenames.map(async (filename) => [filename, await upload(filename)])),
);

const articles = [
  ['Summer Essentials', 'summer-essentials', 'A considered edit of warm-weather pieces that make getting dressed feel effortless.', 'summer-essentials.png'],
  ['Workwear Refresh', 'workwear-refresh', 'Soft tailoring, clean layers, and a sharper way to return to the week.', 'workwear-refresh.png'],
  ['Accessories That Elevate', 'accessories-that-elevate', 'The sunglasses, scent, and jewelry details that quietly transform an outfit.', 'accessories-elevate.png'],
  ['Real Style. Real Stories.', 'real-style-real-stories', 'Asiance members share the personal references behind what they wear.', 'real-style-stories.png'],
  ['NYFW: Top Shows', 'nyfw-top-shows', 'The silhouettes, colors, and new ideas our editors are still thinking about.', 'nyfw-top-shows.png'],
];

for (const [title, slug, excerpt, image] of articles) {
  const payload = {
    title,
    slug,
    category: 'Fashion and Beauty',
    excerpt,
    content: `<p>${excerpt}</p><h2>The Asiance edit</h2><p>Personal style is built through pieces that feel useful, expressive, and genuinely yours. Our editors gathered the details worth carrying into the season.</p>`,
    image: urls[image],
    authorName: 'Asiance Editors',
    tags: ['fashion', 'style', 'editors-pick'],
    featured: true,
    status: 'published',
    publishedAt: new Date().toISOString(),
  };
  const exists = await fetch(`${api}/articles/${slug}`).then((response) => response.ok);
  const response = await fetch(`${api}/articles${exists ? `/${slug}` : ''}`, {
    method: exists ? 'PATCH' : 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Article save failed for ${slug}: ${response.status} ${await response.text()}`);
}

const products = [
  ['Floral Maxi Dress', 'floral-maxi-dress', 168, 'floral-maxi-dress.png'],
  ['Linen Blazer', 'linen-blazer', 128, 'linen-blazer.png'],
  ['Ribbed Tank Top', 'ribbed-tank-top', 42, 'ribbed-tank-top.png'],
  ['Leather Shoulder Bag', 'leather-shoulder-bag', 78, 'leather-shoulder-bag.png'],
  ['Strappy Heeled Sandal', 'strappy-heeled-sandal', 88, 'strappy-heeled-sandal.png'],
];

for (const [name, slug, price, image] of products) {
  const payload = {
    name,
    slug,
    sku: `FASHION-${slug.toUpperCase()}`,
    category: 'Fashion',
    categorySlug: 'fashion',
    price,
    image: urls[image],
    images: [],
    tags: ['fashion', 'shop-the-look'],
    description: `${name} selected for the Asiance fashion edit.`,
    shortDescription: 'A refined everyday piece from the Asiance fashion edit.',
    stock: 24,
    stockManagement: true,
    stockStatus: 'instock',
    menuOrder: 0,
    enableReviews: true,
    availableForPos: true,
    type: 'simple',
    virtual: false,
    downloadable: false,
    status: 'active',
  };
  const exists = await fetch(`${api}/shop/products/${slug}`).then((response) => response.ok);
  const response = await fetch(`${api}/shop/products${exists ? `/${slug}` : ''}`, {
    method: exists ? 'PATCH' : 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Product save failed for ${slug}: ${response.status} ${await response.text()}`);
}

console.log(JSON.stringify({ urls, articleSlugs: articles.map((item) => item[1]), productSlugs: products.map((item) => item[1]) }, null, 2));
