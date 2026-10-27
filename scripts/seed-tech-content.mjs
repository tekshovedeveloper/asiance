const apiUrl = (process.env.API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this seed.');
}

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
    throw new Error(`${options.method || 'GET'} ${path}: ${message || response.statusText}`);
  }
  return body;
}

const login = await request('/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
});

if (login.user?.role !== 'admin' || !login.accessToken) {
  throw new Error('The supplied account is not an administrator.');
}

const token = login.accessToken;
const publishedAt = new Date().toISOString();

const articles = [
  {
    title: 'Samsung Galaxy Buds3 Pro Review: Perfectly Tuned',
    slug: 'samsung-galaxy-buds3-pro-review-perfectly-tuned',
    category: 'Technology',
    excerpt: 'We tested the new Galaxy Buds3 Pro for sound, comfort, and AI features. Here is everything you need to know.',
    image: '/tech/stories/galaxy-buds3-pro.png',
    authorName: 'Asiance Tech Editors',
    tags: ['audio', 'reviews', 'gadgets'],
    featured: true,
    status: 'published',
    publishedAt,
    content: `<p>Samsung’s Galaxy Buds3 Pro bring a confident new shape, detailed sound, and genuinely useful everyday features to the company’s premium earbuds.</p><h2>Sound that feels spacious</h2><p>The two-way speaker system keeps vocals clear while giving bass enough weight for pop, podcasts, and films. Adaptive equalization makes small adjustments as your environment changes, so the sound remains balanced on the train and at your desk.</p><h2>Comfort and controls</h2><p>The updated stem design makes swipe and pinch controls easier to find. The buds sit securely without excessive pressure, and the charging case is compact enough for a small bag or jacket pocket.</p><h2>Our verdict</h2><p>Galaxy phone owners get the deepest integration, but the Buds3 Pro stand out on sound quality alone. They are a polished choice for listeners who want premium audio with practical smart features.</p>`,
  },
  {
    title: 'How AI Is Transforming Healthcare',
    slug: 'how-ai-is-transforming-healthcare',
    category: 'Technology',
    excerpt: 'From earlier detection to lighter administrative work, AI is changing how care is delivered.',
    image: '/tech/topics/ai-tools.png',
    authorName: 'Asiance Tech Editors', tags: ['ai', 'healthcare', 'future', 'privacy'], featured: false, status: 'published', publishedAt,
    content: `<p>Artificial intelligence is becoming a practical tool for clinicians, researchers, and patients. Its most promising role is not replacing human judgment, but giving health professionals better information sooner.</p><h2>Earlier and more consistent detection</h2><p>Pattern-recognition systems can help flag subtle changes in medical images and patient records. Used responsibly, these tools give care teams another layer of review.</p><h2>More time for patients</h2><p>AI-assisted notes, scheduling, and routine communication can reduce administrative work. The result can be more time for the conversations that build trust between patients and clinicians.</p><h2>Responsible progress matters</h2><p>Privacy, representative data, and human oversight remain essential. Healthcare AI succeeds when accuracy and equity are treated as product requirements rather than afterthoughts.</p>`,
  },
  {
    title: 'MacBook Air M3 vs. M2: What’s New?',
    slug: 'macbook-air-m3-vs-m2-whats-new',
    category: 'Technology',
    excerpt: 'A practical guide to the performance, display support, and value differences that matter.',
    image: '/tech/topics/laptops.png',
    authorName: 'Asiance Tech Editors', tags: ['laptops', 'reviews', 'buying-guides'], featured: false, status: 'published', publishedAt,
    content: `<p>The M3 MacBook Air keeps the familiar thin design while adding a faster chip and better support for external displays. For most everyday work, both generations still feel quick.</p><h2>Where M3 pulls ahead</h2><p>Photo exports, code builds, and graphics-heavy tasks benefit most from the newer processor. M3 also supports two external displays when the laptop lid is closed.</p><h2>Why M2 remains compelling</h2><p>The M2 model delivers excellent battery life and more than enough performance for writing, browsing, school, and office work. A meaningful discount can make it the smarter value.</p><h2>Which should you buy?</h2><p>Choose M3 for heavier creative work or a longer upgrade runway. Choose M2 when price matters and your daily workload is light to moderate.</p>`,
  },
  {
    title: '5 Productivity Apps That Actually Save Time',
    slug: 'five-productivity-apps-that-actually-save-time',
    category: 'Technology',
    excerpt: 'Five focused tools that reduce busywork instead of giving you another system to manage.',
    image: '/tech/topics/phones.png',
    authorName: 'Asiance Tech Editors', tags: ['apps', 'productivity', 'software', 'family-tech'], featured: false, status: 'published', publishedAt,
    content: `<p>The best productivity app is the one that removes friction. These five categories—task capture, calendar planning, password management, document scanning, and automation—solve specific problems without demanding a complicated setup.</p><h2>Start with one bottleneck</h2><p>Choose the repeated task that costs you the most time. Test one tool for a week, keep notifications minimal, and measure whether it genuinely makes the work easier.</p><h2>Build a small, connected toolkit</h2><p>A calendar, task list, cloud drive, password manager, and a simple automation app cover most needs. Consistent habits matter more than collecting features.</p>`,
  },
  {
    title: 'The Rise of Asian Americans in Tech',
    slug: 'rise-of-asian-americans-in-tech',
    category: 'Technology',
    excerpt: 'Meet the builders turning community insight into ambitious companies and more inclusive products.',
    image: '/tech/stories/asian-founders.png',
    authorName: 'Asiance Tech Editors', tags: ['startups', 'founders', 'community'], featured: false, status: 'published', publishedAt,
    content: `<p>Asian American founders are building across fintech, health, commerce, climate, and culture. Their companies often begin with a problem understood through lived experience and grow into products with broad relevance.</p><h2>Community knowledge as an advantage</h2><p>Understanding multilingual households, cross-border commerce, and overlooked customer needs can reveal opportunities that conventional market research misses.</p><h2>Building the next network</h2><p>Founder communities, mentorship, and more visible role models are expanding access to capital and expertise. That stronger network helps the next generation start with a wider set of possibilities.</p>`,
  },
];

const products = [
  { name: 'Samsung Galaxy Buds3 Pro', slug: 'samsung-galaxy-buds3-pro', sku: 'TECH-GB3P-007', price: 249.99, image: '/tech/products/galaxy-buds3-pro-angle.png', images: ['/tech/products/galaxy-buds3-pro-angle.png', '/tech/products/galaxy-buds3-pro-macro.png', '/tech/products/galaxy-buds3-pro-top.png'], shortDescription: 'Premium wireless earbuds with rich sound, adaptive noise control, and a refined metallic finish.', brands: ['Samsung'] },
  { name: 'Apple AirPods Max', slug: 'apple-airpods-max', sku: 'TECH-APM-001', price: 549, image: '/tech/products/airpods-max.jpg', shortDescription: 'Premium over-ear headphones with immersive sound and active noise cancellation.', brands: ['Apple'] },
  { name: 'iPad Air (M2)', slug: 'ipad-air-m2', sku: 'TECH-IPAM2-002', price: 599, image: '/tech/products/ipad-air-m2.jpg', shortDescription: 'A powerful, portable tablet for creativity, work, and entertainment.', brands: ['Apple'] },
  { name: 'Anker 737 Power Bank', slug: 'anker-737-power-bank', sku: 'TECH-ANK737-003', price: 109.99, image: '/tech/products/anker-737.png', shortDescription: 'High-capacity portable power with fast charging for laptops and phones.', brands: ['Anker'] },
  { name: 'Logitech MX Master 3S', slug: 'logitech-mx-master-3s', sku: 'TECH-MX3S-004', price: 99.99, image: '/tech/products/mx-master-3s.png', shortDescription: 'An ergonomic wireless mouse with quiet clicks and precise tracking.', brands: ['Logitech'] },
  { name: 'Sony WH-1000XM5', slug: 'sony-wh1000xm5', sku: 'TECH-SXM5-005', price: 399.99, image: '/tech/products/sony-wh1000xm5.png', shortDescription: 'Wireless headphones with exceptional noise cancellation and all-day comfort.', brands: ['Sony'] },
  { name: 'The Frame TV (55\")', slug: 'the-frame-tv-55', sku: 'TECH-FRAME55-006', price: 1299.99, image: '/tech/products/frame-tv.jpg', shortDescription: 'A 55-inch lifestyle television designed to display art beautifully between shows.', brands: ['Samsung'] },
  { name: 'Apple Watch Series 9', slug: 'apple-watch-series-9-deal', sku: 'TECH-AWS9-008', price: 399, salePrice: 299, badge: '25% off', image: '/tech/deals/apple-watch-series-9.png', shortDescription: 'A capable everyday smartwatch for activity, communication, and health insights.', brands: ['Apple'] },
  { name: 'Kindle Paperwhite', slug: 'kindle-paperwhite-deal', sku: 'TECH-KPW-009', price: 149, salePrice: 119, badge: '20% off', image: '/tech/deals/kindle-paperwhite.png', shortDescription: 'A glare-free e-reader with a crisp display and weeks of battery life.', brands: ['Amazon'] },
  { name: 'Echo Dot (5th Gen)', slug: 'echo-dot-5th-gen-deal', sku: 'TECH-ECHO5-010', price: 49.99, salePrice: 29.99, badge: '40% off', image: '/tech/deals/echo-dot-5.png', shortDescription: 'A compact smart speaker for music, timers, information, and connected-home control.', brands: ['Amazon'] },
].map((product, index) => ({
  ...product,
  category: 'Technology',
  categorySlug: 'technology',
  images: product.images ?? [product.image],
  tags: ['tech', 'featured'],
  description: `${product.shortDescription} Selected by the Asiance Tech editors for thoughtful design, dependable everyday performance, and a polished user experience.`,
  stock: 25,
  stockManagement: true,
  stockStatus: 'instock',
  menuOrder: index + 1,
  enableReviews: true,
  availableForPos: true,
  type: 'simple',
  status: 'active',
  details: [
    { title: 'Why we chose it', description: 'A strong combination of design, usability, and everyday value.' },
    { title: 'Shipping', description: 'Carefully packed and ready to ship.' },
  ],
}));

const activities = [
  {
    text: 'Choosing a college laptop can be confusing. Which model gives the best mix of battery life, portability, performance, and price for four years of study?',
    targetName: 'Best laptop for college students?',
    targetSlug: 'tech-community-best-laptop',
    hashtags: ['tech', 'laptops', 'college'],
    media: [{ type: 'image', url: '/tech/community/best-laptop-question.png', caption: 'Community laptop recommendations' }],
  },
  {
    text: 'My minimalist tech desk setup keeps only the tools I use every day: a lightweight laptop, one smart speaker, soft lighting, and plenty of plants.',
    targetName: 'My minimalist tech desk setup',
    targetSlug: 'tech-community-minimalist-desk',
    hashtags: ['tech', 'workspace', 'minimalism'],
    media: [{ type: 'image', url: '/tech/community/minimalist-desk-tip.png', caption: 'A minimalist technology workspace' }],
  },
  {
    text: 'I finally switched to Android. The customization, split-screen workflow, notification controls, and device flexibility are the features I appreciate most.',
    targetName: 'Finally switched to Android — here’s what I love',
    targetSlug: 'tech-community-android-switch',
    hashtags: ['tech', 'android', 'phones'],
    media: [{ type: 'image', url: '/tech/community/android-switch-post.png', caption: 'Android phone and laptop setup' }],
  },
  {
    text: 'After several weeks with a compact camera drone, the improved tracking, obstacle sensing, and image quality make the upgrade meaningful for frequent creators.',
    targetName: 'DJI Mini 4 Pro Review: Worth the upgrade!',
    targetSlug: 'tech-community-drone-review',
    hashtags: ['tech', 'drones', 'reviews'],
    media: [{ type: 'image', url: '/tech/community/drone-review.png', caption: 'Compact camera drone in flight' }],
  },
  {
    text: 'These are the AI tools that help with meeting notes, customer questions, content drafts, and repetitive administration in my small business.',
    targetName: 'AI tools that help me run my small business',
    targetSlug: 'tech-community-ai-business',
    hashtags: ['tech', 'ai', 'small-business'],
    media: [{ type: 'image', url: '/tech/community/ai-small-business.png', caption: 'Smart tools for a small business desk' }],
  },
].map((activity) => ({ ...activity, type: 'post', privacy: 'public', featured: true }));

const [articleCategories, productCategories] = await Promise.all([
  request('/articles/categories'),
  request('/shop/categories'),
]);

if (!articleCategories.some((item) => item.slug === 'technology' || item.name === 'Technology')) {
  await request('/articles/categories', { method: 'POST', token, body: JSON.stringify({ name: 'Technology', slug: 'technology', description: 'Technology reviews, guides, and innovation.', sortOrder: 20 }) });
}

if (!productCategories.some((item) => item.slug === 'technology' || item.name === 'Technology')) {
  await request('/shop/categories', { method: 'POST', token, body: JSON.stringify({ name: 'Technology', slug: 'technology', description: 'Editor-selected technology and accessories.', displayType: 'products' }) });
}

const [existingArticles, existingProducts, existingActivities] = await Promise.all([
  request('/articles/admin/items', { token }),
  request('/shop/products?admin=true', { token }),
  request('/activity'),
]);

for (const article of articles) {
  const exists = existingArticles.some((item) => item.slug === article.slug);
  await request(`/articles${exists ? `/${article.slug}` : ''}`, {
    method: exists ? 'PATCH' : 'POST',
    token,
    body: JSON.stringify(article),
  });
  console.log(`${exists ? 'Updated' : 'Created'} article: ${article.title}`);
}

for (const product of products) {
  const exists = existingProducts.some((item) => item.slug === product.slug);
  await request(`/shop/products${exists ? `/${product.slug}` : ''}`, {
    method: exists ? 'PATCH' : 'POST',
    token,
    body: JSON.stringify(product),
  });
  console.log(`${exists ? 'Updated' : 'Created'} product: ${product.name}`);
}

for (const activity of activities) {
  const existing = existingActivities.find((item) => item.targetSlug === activity.targetSlug);
  await request(`/activity${existing ? `/${existing._id}` : ''}`, {
    method: existing ? 'PATCH' : 'POST',
    token,
    body: JSON.stringify(activity),
  });
  console.log(`${existing ? 'Updated' : 'Created'} community post: ${activity.targetName}`);
}

console.log(`Tech content ready: ${articles.length} articles, ${products.length} products, and ${activities.length} community posts.`);
