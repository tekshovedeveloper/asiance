const apiUrl = (process.env.API_URL || 'http://localhost:4000/api').replace(/\/$/, '');
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) throw new Error('Set ADMIN_EMAIL and ADMIN_PASSWORD before running this seed.');

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

const image = {
  featuredGarden: '/dating/wedding-magazine/featured-garden-wedding.png',
  pearlPins: '/dating/wedding-magazine/pearl-hair-pins.png',
  weddingHanger: '/dating/wedding-magazine/personalised-hanger.png',
  bouquetRibbon: '/dating/wedding-magazine/silk-ribbon-bouquet.png',
  vowBooks: '/dating/wedding-magazine/vow-books.png',
  bridesmaidGift: '/dating/wedding-magazine/bridesmaid-gift-box.png',
  weddingCandle: '/dating/wedding-magazine/scented-candle.png',
  planning: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549598/asiance/uploads/planning_ncgvzr.png',
  venues: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549609/asiance/uploads/venues_vtqkox.png',
  fashion: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549611/asiance/uploads/fashion_k4gfau.png',
  decor: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549613/asiance/uploads/decor_pzzyty.png',
  honeymoons: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549625/asiance/uploads/honeymoons_h985i7.png',
  aria: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549633/asiance/uploads/aria-jason_wprvnv.png',
  priya: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549639/asiance/uploads/priya-rohan_cletcz.png',
  michelle: 'https://res.cloudinary.com/ux81wsbq/image/upload/v1786549641/asiance/uploads/michelle-daniel_oxfng3.png',
};

const publishedAt = new Date().toISOString();
const articleBase = { category: 'Weddings', authorName: 'Asiance Weddings', status: 'published', publishedAt };
const coreArticles = [
  { title: 'Aria & Jason’s Romantic Garden Wedding in NYC', slug: 'aria-jason-romantic-garden-wedding-nyc', excerpt: 'A modern celebration filled with meaningful traditions, lush florals and timeless style.', image: image.featuredGarden, tags: ['real-weddings', 'new-york', 'garden'], featured: true },
  { title: '10 Budget-Friendly Ways to Elevate Your Wedding', slug: 'budget-friendly-ways-to-elevate-your-wedding', excerpt: 'Thoughtful details that make your celebration feel special without stretching the budget.', image: image.planning, tags: ['planning', 'budget'] },
  { title: '2024 Wedding Dress Trends We’re Loving', slug: '2024-wedding-dress-trends-loving', excerpt: 'Modern silhouettes, romantic texture, and bridal looks made for a personal celebration.', image: image.fashion, tags: ['fashion', 'bridal'] },
  { title: 'Bridal Skincare Timeline for Glowing Skin', slug: 'bridal-skincare-timeline-glowing-skin', excerpt: 'A calm, practical beauty plan for healthy-looking skin from engagement to wedding day.', image: image.priya, tags: ['beauty', 'skincare'] },
  { title: 'Asian Wedding Traditions & Their Beautiful Meanings', slug: 'asian-wedding-traditions-beautiful-meaning', excerpt: 'A celebration of rituals that honor family, heritage, and the beginning of a shared life.', image: image.decor, tags: ['culture', 'traditions'] },
  { title: 'Best Honeymoon Destinations for Every Season', slug: 'best-honeymoon-destinations-for-every-season', excerpt: 'Romantic escapes for every climate, travel style, and time of year.', image: image.honeymoons, tags: ['honeymoons', 'travel'] },
  {
    title: 'Wedding Reception Lighting Ideas That Feel Magical',
    slug: 'wedding-reception-lighting-ideas',
    excerpt: 'Layer candles, warm overhead light, and thoughtful focal points to create an inviting celebration after sunset.',
    image: '/dating/community/table-settings.png',
    tags: ['reception', 'decor', 'lighting'],
    content: '<p>Lighting changes how a wedding reception feels more than almost any other design detail. The goal is to help guests see comfortably while keeping the room warm, flattering, and memorable.</p><h2>Begin with practical light</h2><p>Confirm the venue’s existing fixtures, dimming controls, power access, and safety rules before adding decorative lighting.</p><h2>Build gentle layers</h2><p>Combine candles, pin spots, pendants, and soft washes rather than relying on one bright source. Highlight tables, flowers, entrances, and the dance floor.</p><h2>Test the atmosphere</h2><p>Ask the lighting team to show the final color temperature and intensity before guests arrive so photography and ambience work together.</p>',
  },
];

const topicArticles = [
  {
    title: 'Real Weddings: Stories, Traditions & Ideas to Make Your Day Yours',
    slug: 'real-weddings-stories-and-inspiration',
    excerpt: 'Real couples share the personal choices, cultural traditions, and joyful details that made their celebrations unforgettable.',
    image: image.featuredGarden,
    tags: ['real-weddings', 'inspiration', 'community'],
    content: '<p>Every wedding becomes memorable through the choices that feel true to the couple. These real celebrations show how family, culture, place, and personality can live beautifully in one day.</p><h2>Begin with your story</h2><p>Choose the rituals, colors, music, food, and people that represent your relationship. A meaningful celebration does not need to copy a template.</p><h2>Make tradition personal</h2><p>Honor family customs with care, explain their meaning to guests, and adapt details so both partners feel included.</p><h2>Ideas worth borrowing</h2><p>Build a thoughtful timeline, create small moments for loved ones, and leave enough space to enjoy the gathering you planned.</p>',
  },
  {
    title: 'The Complete Wedding Planning Timeline',
    slug: 'complete-wedding-planning-timeline-guide',
    excerpt: 'A calm, practical roadmap from the first conversation to the final wedding-week details.',
    image: image.planning,
    tags: ['planning', 'timeline', 'checklist'],
    content: '<p>A clear timeline turns wedding planning into a series of manageable decisions. Start with priorities, then book the people and places that shape everything else.</p><h2>12–18 months before</h2><p>Set a working budget, estimate the guest count, choose a season, and begin venue research. Discuss which cultural and family traditions matter most.</p><h2>6–12 months before</h2><p>Book key vendors, choose attire, plan photography, and send save-the-dates. Keep every contract and payment date in one shared place.</p><h2>The final months</h2><p>Confirm the ceremony flow, seating, transportation, beauty schedule, and vendor arrival times. Protect the final week from unnecessary new decisions.</p>',
  },
  {
    title: 'Wedding Fashion & Bridal Style: A Modern Guide',
    slug: 'wedding-fashion-and-bridal-style-guide',
    excerpt: 'Modern silhouettes, meaningful cultural details, and styling choices that still feel like you.',
    image: image.fashion,
    tags: ['wedding-fashion', 'bridal-style', 'attire'],
    content: '<p>The best wedding look feels special without making you feel disguised. Begin with comfort, setting, and personal style before thinking about trends.</p><h2>Choose the silhouette first</h2><p>Try shapes that support the way you want to move throughout the ceremony, portraits, dinner, and dancing.</p><h2>Blend modern and traditional style</h2><p>Family textiles, jewelry, embroidery, and ceremonial looks can sit beautifully beside contemporary tailoring.</p><h2>Finish with intention</h2><p>Use accessories, shoes, and beauty details to create one coherent look rather than competing statements.</p>',
  },
  {
    title: 'Bridal Beauty & Wedding Hair: Your Calm Preparation Guide',
    slug: 'bridal-beauty-and-wedding-hair-guide',
    excerpt: 'A realistic beauty and hair timeline focused on healthy preparation, trusted products, and feeling comfortable.',
    image: image.priya,
    tags: ['bridal-beauty', 'wedding-hair', 'skincare'],
    content: '<p>Wedding beauty works best when it builds on routines your skin and hair already understand. Consistency matters more than a last-minute overhaul.</p><h2>Start with healthy foundations</h2><p>Keep skincare gentle, schedule professional treatments early, and test any new product well before the wedding.</p><h2>Plan the hair trial</h2><p>Bring veil, jewelry, neckline references, and honest photos of your natural texture to create a style that lasts comfortably.</p><h2>Prepare a small touch-up kit</h2><p>Pack lip color, blotting papers, pins, tissues, and anything recommended by your artist.</p>',
  },
  {
    title: 'Unique Wedding Venues: How to Find the Right Setting',
    slug: 'unique-wedding-venues-guide',
    excerpt: 'From gardens and galleries to rooftops and heritage spaces, find a venue that supports your celebration.',
    image: image.venues,
    tags: ['venues', 'wedding-planning', 'locations'],
    content: '<p>A venue is more than a backdrop. It determines the flow, comfort, timing, and atmosphere of the entire wedding day.</p><h2>Match the space to your priorities</h2><p>Consider guest count, ceremony needs, cultural rituals, accessibility, weather plans, and travel before falling in love with a photograph.</p><h2>Ask practical questions</h2><p>Confirm vendor restrictions, sound limits, setup hours, catering rules, parking, power, and the real rain plan.</p><h2>Let the venue do some of the work</h2><p>A setting with strong architecture or natural beauty can reduce the amount of decoration required.</p>',
  },
  {
    title: 'Wedding Vendors We Love: Building Your Dream Team',
    slug: 'wedding-vendors-we-love-guide',
    excerpt: 'How to choose collaborative wedding professionals who understand your vision, culture, and priorities.',
    image: image.bouquetRibbon,
    tags: ['vendors', 'planning', 'wedding-team'],
    content: '<p>Great vendors do more than deliver a service. They communicate clearly, solve problems calmly, and make space for the traditions that matter to you.</p><h2>Look beyond the portfolio</h2><p>Ask about process, response time, backup plans, accessibility, and experience with your venue and cultural celebrations.</p><h2>Share the complete vision</h2><p>Provide a concise brief with priorities, references, timing, and the people responsible for final decisions.</p><h2>Build a collaborative team</h2><p>Introduce key vendors early and make sure the planner, venue, photographer, florist, and entertainment team share one timeline.</p>',
  },
  {
    title: 'Honeymoon Ideas for Every Kind of Couple',
    slug: 'honeymoon-ideas-for-every-couple',
    excerpt: 'Relaxing beaches, food-focused cities, nature escapes, and meaningful adventures for your first trip together.',
    image: image.honeymoons,
    tags: ['honeymoons', 'travel', 'couples'],
    content: '<p>The right honeymoon reflects how you actually enjoy spending time together. Rest, exploration, food, nature, and family visits can all shape the trip.</p><h2>Choose the feeling first</h2><p>Decide whether you want recovery, adventure, cultural discovery, or a balanced itinerary before choosing a destination.</p><h2>Plan around the season</h2><p>Compare weather, crowds, travel time, and local holidays. A shoulder-season trip can offer better value and a gentler pace.</p><h2>Leave space in the itinerary</h2><p>Book the essential experiences, then protect unplanned time for long meals, walks, and rest.</p>',
  },
  {
    title: 'Engagement Stories & Proposal Ideas with Meaning',
    slug: 'engagement-stories-and-proposal-ideas',
    excerpt: 'Thoughtful proposal ideas inspired by real relationships, shared memories, and the people you love.',
    image: '/dating/community/proposal-santorini.png',
    tags: ['engagements', 'proposals', 'love-stories'],
    content: '<p>A meaningful proposal does not depend on spectacle. It works when the setting, words, and timing feel connected to your relationship.</p><h2>Start with shared memories</h2><p>Return to a favorite place, build around a familiar ritual, or include an object that carries a story only the two of you understand.</p><h2>Decide who should be present</h2><p>Some couples want a private moment; others want family close by. Choose based on your partner, not outside expectations.</p><h2>Plan the practical details</h2><p>Think through timing, weather, privacy, photography, transportation, and how you will celebrate afterward.</p>',
  },
  {
    title: 'Asian Wedding Traditions: A Thoughtful Guide for Modern Couples',
    slug: 'asian-wedding-traditions-guide',
    excerpt: 'Explore meaningful customs across Asian cultures and learn how modern couples can honor them with care.',
    image: image.michelle,
    tags: ['asian-weddings', 'traditions', 'culture'],
    content: '<p>Asian weddings contain a rich range of family rituals, ceremonial clothing, foods, gifts, and symbols. Every community and family practices them differently.</p><h2>Learn the meaning together</h2><p>Invite parents and elders to explain the history behind important customs, then decide as a couple which traditions reflect your values.</p><h2>Help guests understand</h2><p>Use programs, signage, or a brief explanation from the officiant so everyone can appreciate what is happening.</p><h2>Honor culture without treating it as decoration</h2><p>Work with knowledgeable vendors, credit the tradition accurately, and make room for the people who carry it.</p>',
  },
];

const articles = [...coreArticles, ...topicArticles].map((article) => ({
  ...articleBase,
  ...article,
  content: article.content ?? `<p>${article.excerpt}</p><h2>Plan it your way</h2><p>The most memorable celebrations feel personal. Use these ideas as a starting point, then choose the details that reflect your story, culture, and community.</p><h2>Our practical advice</h2><p>Set priorities early, keep communication clear, and leave space to enjoy the people gathering with you.</p>`,
}));

const productSeed = [
  ['Minimal Pearl Hair Pins Set', 'minimal-pearl-hair-pins-set', 'WED-PEARL-001', 46, image.pearlPins],
  ['Personalised Wedding Hanger', 'personalised-wedding-hanger', 'WED-HANGER-002', 28, image.weddingHanger],
  ['Silk Ribbon Bouquet Tie', 'silk-ribbon-bouquet-tie', 'WED-RIBBON-003', 32, image.bouquetRibbon],
  ['Custom Wedding Vow Books', 'custom-wedding-vow-books', 'WED-VOW-004', 36, image.vowBooks],
  ['Bridesmaid Gift Box Set', 'bridesmaid-gift-box-set', 'WED-GIFT-005', 56, image.bridesmaidGift],
  ['Scented Candle “Happily Ever After”', 'scented-candle-happily-ever-after', 'WED-CANDLE-006', 24, image.weddingCandle],
];

const products = productSeed.map(([name, slug, sku, price, productImage], index) => ({
  name, slug, sku, price, image: productImage, images: [productImage],
  category: 'Wedding', categorySlug: 'wedding', tags: ['wedding', 'gift'],
  shortDescription: 'An editor-selected detail for a thoughtful, beautifully personal celebration.',
  description: 'Chosen by Asiance Weddings for timeless style, careful finishing, and meaningful gifting.',
  stock: 25, stockManagement: true, stockStatus: 'instock', menuOrder: index + 1,
  enableReviews: true, availableForPos: true, type: 'simple', status: 'active',
  details: [
    { title: 'Why we chose it', description: 'A refined wedding detail designed to feel personal and useful.' },
    { title: 'Shipping', description: 'Carefully packed and ready to ship.' },
  ],
}));

const activities = [
  { text: 'Our proposal story in Santorini was intimate, joyful, and completely unexpected.', targetName: 'Our Proposal Story in Santorini', targetSlug: 'wedding-community-santorini-proposal', media: [{ type: 'image', url: '/dating/community/proposal-santorini.png', caption: 'A romantic wedding proposal story' }] },
  { text: 'Help! Which wedding dress should I choose? I love the clean silhouette and the romantic details.', targetName: 'Help! Which Dress Should I Choose?', targetSlug: 'wedding-community-dress-choice', media: [{ type: 'image', url: '/dating/community/dress-choice.png', caption: 'Wedding dress inspiration' }] },
  { text: 'These thoughtful choices helped us save on our wedding while keeping the celebration personal.', targetName: 'How We Saved on Our Wedding', targetSlug: 'wedding-community-budget-tip', media: [{ type: 'image', url: image.featuredGarden, caption: 'A meaningful garden wedding' }] },
  { text: 'Tea ceremony decor ideas that blend family tradition with soft modern florals.', targetName: 'Tea Ceremony Decor Ideas', targetSlug: 'wedding-community-tea-ceremony', media: [{ type: 'image', url: '/dating/community/tea-ceremony.png', caption: 'Tea ceremony wedding details' }] },
  { text: 'Minimalist wedding table settings with warm candlelight, natural texture, and seasonal flowers.', targetName: 'Minimalist Wedding Table Settings', targetSlug: 'wedding-community-table-settings', media: [{ type: 'image', url: '/dating/community/table-settings.png', caption: 'Minimal wedding table decor' }] },
].map((activity) => ({ ...activity, type: 'post', privacy: 'public', featured: true, hashtags: ['weddings', 'community'] }));

const weddingCircle = {
  name: 'Asiance Weddings Community',
  slug: 'asiance-weddings-community',
  groupTypeSlug: 'weddings',
  category: 'Weddings',
  privacy: 'public',
  description: 'A welcoming circle for brides, grooms, partners, families, vendors, and wedding lovers to share plans, traditions, questions, and real celebrations.',
  bio: 'Connect with couples and wedding professionals who understand meaningful, multicultural celebrations.',
  image: image.featuredGarden,
  profilePicture: image.featuredGarden,
  coverPhoto: '/dating/weddings-hero.png',
  tags: ['weddings', 'planning', 'bridal', 'community'],
};

const login = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
if (login.user?.role !== 'admin' || !login.accessToken) throw new Error('The supplied account is not an administrator.');
const token = login.accessToken;

const [articleCategories, productCategories, groupTypes] = await Promise.all([
  request('/articles/categories'),
  request('/shop/categories'),
  request('/group-types'),
]);

if (!articleCategories.some((item) => item.slug === 'weddings' || item.name === 'Weddings')) {
  await request('/articles/categories', { method: 'POST', token, body: JSON.stringify({ name: 'Weddings', slug: 'weddings', description: 'Real weddings, planning, culture, fashion, and inspiration.', sortOrder: 25 }) });
}
if (!productCategories.some((item) => item.slug === 'wedding' || item.name === 'Wedding')) {
  await request('/shop/categories', { method: 'POST', token, body: JSON.stringify({ name: 'Wedding', slug: 'wedding', description: 'Wedding details, gifts, and celebration essentials.', displayType: 'products' }) });
}
if (!groupTypes.some((item) => item.slug === 'weddings' || item.name === 'Weddings')) {
  await request('/group-types', { method: 'POST', token, body: JSON.stringify({ name: 'Weddings', slug: 'weddings', description: 'Wedding planning, culture, inspiration, and real celebrations.' }) });
}

const [existingArticles, existingProducts, existingActivities, existingGroups] = await Promise.all([
  request('/articles/admin/items', { token }),
  request('/shop/products?admin=true', { token }),
  request('/activity'),
  request('/groups'),
]);

for (const article of articles) {
  const exists = existingArticles.some((item) => item.slug === article.slug);
  await request(`/articles${exists ? `/${article.slug}` : ''}`, { method: exists ? 'PATCH' : 'POST', token, body: JSON.stringify(article) });
  console.log(`${exists ? 'Updated' : 'Created'} article: ${article.title}`);
}

for (const product of products) {
  const exists = existingProducts.some((item) => item.slug === product.slug);
  await request(`/shop/products${exists ? `/${product.slug}` : ''}`, { method: exists ? 'PATCH' : 'POST', token, body: JSON.stringify(product) });
  console.log(`${exists ? 'Updated' : 'Created'} product: ${product.name}`);
}

const existingCircle = existingGroups.find((group) => group.slug === weddingCircle.slug);
await request(`/groups${existingCircle ? `/${weddingCircle.slug}` : ''}`, {
  method: existingCircle ? 'PATCH' : 'POST',
  token,
  body: JSON.stringify(weddingCircle),
});
console.log(`${existingCircle ? 'Updated' : 'Created'} circle: ${weddingCircle.name}`);

for (const activity of activities) {
  const existing = existingActivities.find((item) => item.targetSlug === activity.targetSlug);
  await request(`/activity${existing ? `/${existing._id}` : ''}`, { method: existing ? 'PATCH' : 'POST', token, body: JSON.stringify(activity) });
  console.log(`${existing ? 'Updated' : 'Created'} community post: ${activity.targetName}`);
}

const circleActivity = await request(`/groups/${weddingCircle.slug}/activity`);
if (!circleActivity.some((item) => item.targetSlug === 'asiance-weddings-community-welcome')) {
  await request('/activity', {
    method: 'POST',
    token,
    body: JSON.stringify({
      type: 'post',
      privacy: 'group',
      groupSlug: weddingCircle.slug,
      targetName: 'Welcome to the Asiance Weddings Community',
      targetSlug: 'asiance-weddings-community-welcome',
      text: 'Welcome! Share your planning questions, favorite traditions, vendor recommendations, inspiration, and real wedding stories with the community.',
      featured: true,
      hashtags: ['weddings', 'community', 'planning'],
      media: [{ type: 'image', url: image.featuredGarden, caption: 'Welcome to the Asiance Weddings Community' }],
    }),
  });
  console.log('Created circle welcome post.');
}

console.log(`Wedding content ready: ${articles.length} articles, ${products.length} products, ${activities.length} community posts, and 1 wedding circle.`);
