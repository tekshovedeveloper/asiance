export type Product = {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  category: string;
  categorySlug?: string;
  sku?: string;
  price: number;
  salePrice?: number;
  image: string;
  images?: string[];
  badge?: string;
  tags?: string[];
  brands?: string[];
  description: string;
  shortDescription?: string;
  stock?: number;
  stockManagement?: boolean;
  stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
  soldIndividually?: boolean;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  shippingClass?: string;
  upsells?: string;
  crossSells?: string;
  attributeName?: string;
  attributeValues?: string;
  attributeVisible?: boolean;
  purchaseNote?: string;
  menuOrder?: number;
  enableReviews?: boolean;
  availableForPos?: boolean;

  attributes?: Array<{
    name: string;
    values: string[];
    visible: boolean;
    variation: boolean;
  }>;

  variations?: Array<{
    id?: string;
    name: string;
    attributes: Record<string, string>;
    sku?: string;
    price?: number;
    salePrice?: number;
    stock?: number;
    stockStatus?: 'instock' | 'outofstock' | 'onbackorder';
    image?: string;
    enabled?: boolean;
  }>;

  type?: 'simple' | 'variable' | 'grouped' | 'external';
  virtual?: boolean;
  downloadable?: boolean;
  status?: 'active' | 'draft' | 'archived';
  createdAt?: string;
  updatedAt?: string;


  details?: Array<{
    title: string;
    description: string;
  }>;
};

export type Article = {
  _id?: string;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  tags?: string[];
  discussionCount?: number;
  featured?: boolean;
  publishedAt?: string;
};

export type NewsCategory = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
};

export type NewsItem = {
  _id?: string;
  title: string;
  slug: string;
  categoryName: string;
  categorySlug: string;
  excerpt: string;
  content: string;
  image: string;
  authorName: string;
  tags?: string[];
  featured?: boolean;
  breaking?: boolean;
  sourceName?: string;
  sourceUrl?: string;
  status?: 'draft' | 'published';
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GroupType = {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
};

export type GroupMember = {
  _id: string;
  name: string;
  handle: string;
  avatar?: string;
  bio?: string;
  status?: string;
};

export type Group = {
  _id?: string;
  name: string;
  slug: string;
  groupTypeSlug?: string;
  category: string;
  privacy: 'public' | 'private';
  description: string;
  bio?: string;
  image: string;
  profilePicture?: string;
  coverPhoto?: string;
  membersCount: number;
  members?: string[];
  pendingMembers?: string[];
  blockedMembers?: string[];
  tags?: string[];
  status?: 'member' | 'pending' | 'none';
};

export type Member = {
  _id?: string;
  id?: string;
  name: string;
  email?: string;
  handle: string;
  role?: 'admin' | 'member';
  avatar?: string;
  bio: string;
  location: string;
  status: string;
  interests?: string[];
};

export type ActivityComment = {
  authorId?: string;
  authorName: string;
  authorHandle?: string;
  body: string;
  likes?: number;
  likedBy?: string[];
  replies?: Array<{
    authorId?: string;
    authorName: string;
    authorHandle?: string;
    body: string;
    createdAt?: string;
  }>;
  createdAt?: string;
};

export type Activity = {
  _id?: string;
  actorId?: string;
  actorName: string;
  actorHandle: string;
  type: 'post' | 'comment' | 'join' | 'thread' | 'product';
  text: string;
  targetName: string;
  targetSlug: string;
  likes: number;
  comments: number;
  reactions?: {
    like: number;
    love: number;
    celebrate: number;
    laugh: number;
    sad: number;
    angry: number;
  };
  reactedBy?: Record<string, 'like' | 'love' | 'celebrate' | 'laugh' | 'sad' | 'angry'>;
  likedBy?: string[];
  commentsList?: ActivityComment[];
  hashtags?: string[];
  mentions?: string[];
  linkPreview?: string;
  quote?: string;
  media?: Array<{ type: string; url: string; caption?: string }>;
  privacy?: 'public' | 'friends' | 'group' | 'private';
  groupSlug?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type ForumThread = {
  _id?: string;
  title: string;
  slug: string;
  category: string;
  groupSlug?: string;
  authorName: string;
  excerpt: string;
  replies: number;
  pinned?: boolean;
  lastActivityAt?: string;
};

export type FileAsset = {
  _id?: string;
  title: string;
  type: 'file' | 'doc' | 'media';
  category: string;
  size: string;
  ownerName: string;
};
