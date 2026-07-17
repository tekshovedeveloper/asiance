'use client';

import Link from 'next/link';
import { use, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { LoadingIndicator } from '@/components/LoadingIndicator';
import { SiteHeader } from '@/components/SiteHeader';
import {
  acceptFriendRequest,
  cancelFriendRequest,
  createOrGetChatThread,
  getArticles,
  getFriendRequests,
  getFriendsList,
  getGroups,
  getMe,
  getMember,
  getMemberActivity,
  getMemberFriends,
  getMemberPurchasedProducts,
  getMyOrders,
  getOutgoingRequests,
  rejectFriendRequest,
  sendFriendRequest,
  type FriendRequest,
  type FriendUser,
} from '@/lib/api';
import type { Activity, Article, Group, Member } from '@/lib/types';

type FriendStatus = 'none' | 'pending-out' | 'pending-in' | 'accepted' | 'me';
type ProfileTab = 'posts' | 'articles' | 'friends' | 'groups' | 'products';

type OrderLine = {
  productId?: string;
  slug?: string;
  name?: string;
  image?: string;
  quantity?: number;
  selectedVariationName?: string;
};

type OrderRecord = {
  status?: string;
  createdAt?: string;
  items?: OrderLine[];
};

type PurchasedProduct = {
  key: string;
  name: string;
  slug?: string;
  image?: string;
  quantity: number;
  variationName?: string;
  lastPurchasedAt?: string;
};

const FALLBACK_AVATAR = '/assets/profile/dummy-profile.png';
const FALLBACK_COVER = '/assets/profile/dummy-cover.png';

function normalizeHandle(value?: string) {
  return (value ?? '').replace(/^@/, '').trim().toLowerCase();
}

function compactNumber(value: number) {
  if (value >= 1000000) return `${Number((value / 1000000).toFixed(1))}M`;
  if (value >= 1000) return `${Number((value / 1000).toFixed(1))}K`;
  return String(value);
}

function formatCardDate(value?: string) {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function sameId(left?: unknown, right?: unknown) {
  const leftId = left == null ? '' : String(left);
  const rightId = right == null ? '' : String(right);
  return Boolean(leftId && rightId && leftId === rightId);
}

function groupBelongsToMember(group: Group, member: Member) {
  const memberId = ((member as any).id ?? (member as any)._id ?? '').toString();
  const groupId = (group._id ?? '').toString();
  const groupMemberIds = group.members ?? [];
  const memberGroupIds = member.groups ?? [];

  return (
    groupMemberIds.some((id) => sameId(id, memberId)) ||
    memberGroupIds.some((id) => sameId(id, groupId))
  );
}

function ordersToPurchasedProducts(orders: OrderRecord[]) {
  const skippedStatuses = new Set(['cancelled', 'refunded', 'failed', 'trash']);
  const products = new Map<string, PurchasedProduct>();

  orders.forEach((order) => {
    if (order.status && skippedStatuses.has(order.status)) return;

    (order.items ?? []).forEach((item) => {
      const name = item.name?.trim();
      if (!name) return;

      const key = item.slug || item.productId || name.toLowerCase();
      const quantity = Number(item.quantity) || 1;
      const existing = products.get(key);

      if (existing) {
        existing.quantity += quantity;
        existing.image = existing.image || item.image;
        existing.slug = existing.slug || item.slug;
        existing.variationName = existing.variationName || item.selectedVariationName;
        if (
          order.createdAt &&
          (!existing.lastPurchasedAt || new Date(order.createdAt) > new Date(existing.lastPurchasedAt))
        ) {
          existing.lastPurchasedAt = order.createdAt;
        }
        return;
      }

      products.set(key, {
        key,
        name,
        slug: item.slug,
        image: item.image,
        quantity,
        variationName: item.selectedVariationName,
        lastPurchasedAt: order.createdAt,
      });
    });
  });

  return Array.from(products.values());
}

function normalizeProfileUrl(value?: string, profileBase?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;

  const cleanHandle = trimmed.replace(/^@/, '');
  if (profileBase && !cleanHandle.includes('/')) {
    return `${profileBase}${cleanHandle}`;
  }

  return `https://${trimmed}`;
}

function normalizeEmailLink(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return '';
  if (/^mailto:/i.test(trimmed) || /^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.includes('@') && !trimmed.includes('/')) return `mailto:${trimmed}`;
  return `https://${trimmed}`;
}

function activityImage(item?: Activity) {
  const image = item?.media?.find((media) => media.type === 'image') ?? item?.media?.[0];
  return image?.url;
}

function activityHref(item: Activity) {
  return item._id ? `/activity/${item._id}` : '/activity';
}

function friendButtonLabel(status: FriendStatus) {
  if (status === 'pending-out') return 'Pending';
  if (status === 'pending-in') return 'Accept';
  if (status === 'accepted') return 'Message';
  return 'Follow';
}

function FacebookIcon() {
  return (
    <svg className="member-app-social-icon member-app-social-icon-facebook" viewBox="0 0 24 24" aria-hidden="true">
      <path
        className="member-app-social-outline"
        d="M14.45 8.15h2.35V4.75h-2.8c-3.18 0-5.15 1.95-5.15 5.17v2.05H6.5v3.42h2.35V22h3.78v-6.61h3.05l.5-3.42h-3.55v-1.72c0-1.12.55-2.1 1.82-2.1Z"
      />
      <path
        className="member-app-social-fill"
        d="M14.45 8.15h2.35V4.75h-2.8c-3.18 0-5.15 1.95-5.15 5.17v2.05H6.5v3.42h2.35V22h3.78v-6.61h3.05l.5-3.42h-3.55v-1.72c0-1.12.55-2.1 1.82-2.1Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg className="member-app-social-icon member-app-social-icon-instagram" viewBox="0 0 24 24" aria-hidden="true">
      <g className="member-app-social-outline">
        <rect x="4.25" y="4.25" width="15.5" height="15.5" rx="4.4" />
        <circle cx="12" cy="12" r="3.55" />
        <circle cx="16.85" cy="7.25" r="0.85" />
      </g>
      <g className="member-app-social-fill">
        <rect x="3.25" y="3.25" width="17.5" height="17.5" rx="5" />
        <circle cx="12" cy="12" r="3.8" />
        <circle cx="16.95" cy="7.05" r="1.05" />
      </g>
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg className="member-app-social-icon member-app-social-icon-tiktok" viewBox="0 0 24 24" aria-hidden="true">
      <path
        className="member-app-social-outline"
        d="M14.45 3.4c.28 2.62 1.78 4.2 4.45 4.55v3.05a7.5 7.5 0 0 1-4.45-1.42v5.62a5.95 5.95 0 1 1-5.95-5.95c.45 0 .9.05 1.32.15v3.25a2.8 2.8 0 1 0 1.35 2.38V3.4h3.28Z"
      />
      <path
        className="member-app-social-fill"
        d="M14.45 3.4c.28 2.62 1.78 4.2 4.45 4.55v3.05a7.5 7.5 0 0 1-4.45-1.42v5.62a5.95 5.95 0 1 1-5.95-5.95c.45 0 .9.05 1.32.15v3.25a2.8 2.8 0 1 0 1.35 2.38V3.4h3.28Z"
      />
    </svg>
  );
}

function SnapchatIcon() {
  return (
    <svg className="member-app-social-icon member-app-social-icon-snapchat" viewBox="0 0 24 24" aria-hidden="true">
      <path
        className="member-app-social-outline"
        d="M12 3.1c-3.05 0-5.15 2.24-5.15 5.38v4.18c0 .78-.32 1.47-.87 1.97-.42.39-.94.66-1.55.8.46 1.1 1.38 1.84 2.71 2.14.17.91.86 1.63 1.76 1.63.47 0 .85-.17 1.24-.36.49-.23 1.02-.48 1.86-.48s1.37.25 1.86.48c.39.19.77.36 1.24.36.9 0 1.59-.72 1.76-1.63 1.33-.3 2.25-1.04 2.71-2.14-.61-.14-1.13-.41-1.55-.8-.55-.5-.87-1.19-.87-1.97V8.48c0-3.14-2.1-5.38-5.15-5.38Z"
      />
      <path
        className="member-app-social-fill"
        d="M12 3.1c-3.05 0-5.15 2.24-5.15 5.38v4.18c0 .78-.32 1.47-.87 1.97-.42.39-.94.66-1.55.8.46 1.1 1.38 1.84 2.71 2.14.17.91.86 1.63 1.76 1.63.47 0 .85-.17 1.24-.36.49-.23 1.02-.48 1.86-.48s1.37.25 1.86.48c.39.19.77.36 1.24.36.9 0 1.59-.72 1.76-1.63 1.33-.3 2.25-1.04 2.71-2.14-.61-.14-1.13-.41-1.55-.8-.55-.5-.87-1.19-.87-1.97V8.48c0-3.14-2.1-5.38-5.15-5.38Z"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="member-app-social-icon member-app-social-icon-mail" viewBox="0 0 24 24" aria-hidden="true">
      <g className="member-app-social-outline">
        <rect x="3.2" y="6" width="17.6" height="12" rx="2.2" />
        <path d="m4.15 7.2 7.85 5.95 7.85-5.95" />
      </g>
      <g className="member-app-social-fill">
        <rect className="member-app-mail-bg" x="2.55" y="5.35" width="18.9" height="13.3" rx="1.9" />
        <path className="member-app-mail-line" d="M3.7 6.9 12 13.25 20.3 6.9" />
        <path className="member-app-mail-line" d="m3.75 17.15 5.9-5.55" />
        <path className="member-app-mail-line" d="m20.25 17.15-5.9-5.55" />
      </g>
    </svg>
  );
}

export default function MemberProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = use(params);
  const router = useRouter();

  const [member, setMember] = useState<Member | null>(null);
  const [activity, setActivity] = useState<Activity[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [profileFriends, setProfileFriends] = useState<FriendUser[]>([]);
  const [profileGroups, setProfileGroups] = useState<Group[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<PurchasedProduct[]>([]);
  const [friendStatus, setFriendStatus] = useState<FriendStatus>('none');
  const [incomingReqId, setIncomingReqId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ProfileTab>('posts');
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        setFriendStatus('none');
        setIncomingReqId(null);
        setIsOwnProfile(false);
        setProfileFriends([]);
        setProfileGroups([]);
        setPurchasedProducts([]);

        const [m, acts, articleList, groupList] = await Promise.all([
          getMember(handle),
          getMemberActivity(handle),
          getArticles(),
          getGroups(),
        ]);

        setMember(m);
        setActivity(acts);
        setArticles(articleList);
        setProfileGroups(groupList.filter((group) => groupBelongsToMember(group, m)));

        const token = localStorage.getItem('asiance_token');
        if (!token) {
          const [publicFriends, publicProducts] = await Promise.all([
            m.showFriends ? getMemberFriends(handle) : Promise.resolve([]),
            m.showProducts ? getMemberPurchasedProducts(handle) : Promise.resolve([]),
          ]);
          setProfileFriends(publicFriends);
          setPurchasedProducts(publicProducts);
          return;
        }

        const me = await getMe();
        const memberId = ((m as any).id ?? (m as any)._id ?? '').toString();

        if (me.id && memberId === me.id) {
          const [friends, orders] = await Promise.all([
            getFriendsList(),
            getMyOrders(),
          ]);
          setIsOwnProfile(true);
          setProfileFriends(friends);
          setPurchasedProducts(ordersToPurchasedProducts(orders as OrderRecord[]));
          setFriendStatus('me');
          return;
        }

        const [publicFriends, publicProducts, friends, outgoing, incoming] = await Promise.all([
          m.showFriends ? getMemberFriends(handle) : Promise.resolve([]),
          m.showProducts ? getMemberPurchasedProducts(handle) : Promise.resolve([]),
          getFriendsList(),
          getOutgoingRequests(),
          getFriendRequests(),
        ]);
        setProfileFriends(publicFriends);
        setPurchasedProducts(publicProducts);

        if (friends.some((f) => f._id.toString() === memberId)) {
          setFriendStatus('accepted');
        } else if (outgoing.some((o) => o.userId === memberId)) {
          setFriendStatus('pending-out');
        } else {
          const req = incoming.find((r) => r.requesterId?.toString() === memberId?.toString()) as FriendRequest | undefined;
          if (req) {
            setFriendStatus('pending-in');
            setIncomingReqId(req.friendshipId?.toString() ?? null);
          } else {
            setFriendStatus('none');
          }
        }
      } catch {
        // Member fallbacks are handled in the API helper.
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [handle]);

  const memberHandle = normalizeHandle(member?.handle ?? handle);
  const profilePosts = useMemo(
    () => activity.filter((item) => item.type === 'post'),
    [activity],
  );
  const memberArticles = useMemo(() => {
    const memberName = member?.name?.trim().toLowerCase() ?? '';

    return articles.filter((article) => {
      const articleHandle = normalizeHandle(article.authorHandle);
      if (articleHandle && articleHandle === memberHandle) return true;
      return Boolean(memberName && article.authorName?.trim().toLowerCase() === memberName);
    });
  }, [articles, member?.name, memberHandle]);

  const totalLikes = useMemo(
    () => activity.reduce((sum, item) => sum + (item.likes ?? 0), 0),
    [activity],
  );

  async function handleAddFriend() {
    if (!member || busy) return;
    const memberId = ((member as any).id ?? (member as any)._id ?? '').toString();
    setBusy(true);
    try {
      await sendFriendRequest(memberId);
      setFriendStatus('pending-out');
    } catch {
      // Keep the current visible state if the request fails.
    } finally {
      setBusy(false);
    }
  }

  async function handleCancelRequest() {
    if (!member || busy) return;
    const memberId = ((member as any).id ?? (member as any)._id ?? '').toString();
    setBusy(true);
    try {
      if (friendStatus === 'pending-in' && incomingReqId) {
        await rejectFriendRequest(incomingReqId);
      } else {
        await cancelFriendRequest(memberId);
      }
      setFriendStatus('none');
      setIncomingReqId(null);
    } catch (err) {
      console.error('Cancel/decline request failed:', err);
    } finally {
      setBusy(false);
    }
  }

  async function handleAcceptRequest() {
    if (!incomingReqId || busy) return;
    setBusy(true);
    try {
      await acceptFriendRequest(incomingReqId);
      setFriendStatus('accepted');
      setIncomingReqId(null);
    } catch (err) {
      console.error('Accept request failed:', err);
      alert((err as Error)?.message ?? 'Failed to accept request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function handleMessage() {
    if (!member || busy) return;
    const memberId = ((member as any).id ?? (member as any)._id ?? '').toString();
    setBusy(true);
    try {
      const thread = await createOrGetChatThread(memberId);
      router.push(`/messages?thread=${thread._id}`);
    } catch (err) {
      alert((err as Error)?.message ?? 'Could not open chat.');
    } finally {
      setBusy(false);
    }
  }

  async function handleFriendAction() {
    if (friendStatus === 'none') return handleAddFriend();
    if (friendStatus === 'pending-out') return handleCancelRequest();
    if (friendStatus === 'pending-in') return handleAcceptRequest();
    if (friendStatus === 'accepted') return handleMessage();
  }

  if (loading || !member) {
    return (
      <>
        <SiteHeader active="Members" />
        <main className="member-app-page">
          <LoadingIndicator label="Loading profile..." />
        </main>
      </>
    );
  }

  const avatar = member.avatar || FALLBACK_AVATAR;
  const cover = member.cover || FALLBACK_COVER;
  const bio = member.bio?.trim() || 'No bio added yet.';
  const interests = member.interests?.filter(Boolean) ?? [];
  const friendCount = member.friendCount ?? member.following?.length ?? 0;
  const featuredPost = profilePosts.find((post) => post.featured) ?? profilePosts[0];
  const latestPosts = profilePosts
    .filter((post) => (featuredPost?._id ? post._id !== featuredPost._id : post !== featuredPost))
    .slice(0, 5);
  const featuredArticle = memberArticles.find((article) => article.featured) ?? memberArticles[0];
  const latestArticles = memberArticles
    .filter((article) => (featuredArticle?._id ? article._id !== featuredArticle._id : article !== featuredArticle))
    .slice(0, 5);
  const emailHref = normalizeEmailLink(member.emailLink || member.email);
  const socialLinks = [
    {
      key: 'facebook',
      label: 'Facebook',
      href: normalizeProfileUrl(member.facebookUrl, 'https://facebook.com/'),
      icon: <FacebookIcon />,
    },
    {
      key: 'instagram',
      label: 'Instagram',
      href: normalizeProfileUrl(member.instagramUrl, 'https://instagram.com/'),
      icon: <InstagramIcon />,
    },
    {
      key: 'tiktok',
      label: 'TikTok',
      href: normalizeProfileUrl(member.tiktokUrl, 'https://tiktok.com/@'),
      icon: <TikTokIcon />,
    },
    {
      key: 'snapchat',
      label: 'Snapchat',
      href: normalizeProfileUrl(member.snapchatUrl, 'https://snapchat.com/add/'),
      icon: <SnapchatIcon />,
    },
    {
      key: 'email',
      label: 'Email',
      href: emailHref,
      icon: <MailIcon />,
    },
  ].filter((item) => item.href);
  const canViewFriends = isOwnProfile || Boolean(member.showFriends);
  const canViewProducts = isOwnProfile || Boolean(member.showProducts);
  const tabs: Array<{ key: ProfileTab; label: string; count: number }> = [
    { key: 'posts', label: 'Posts', count: profilePosts.length },
    { key: 'articles', label: 'Articles', count: memberArticles.length },
    { key: 'friends', label: 'Friends', count: profileFriends.length || friendCount },
    { key: 'groups', label: 'Groups', count: profileGroups.length },
    { key: 'products', label: 'Products', count: purchasedProducts.length },
  ];

  return (
    <>
      <SiteHeader active="Members" />
      <main className="member-app-page">
        <div className="member-app-shell">
          <section className="member-app-hero">
            <img className="member-app-cover-image" src={cover} alt="" />
          </section>

          <section className="member-app-profile-head">
            <img className="member-app-avatar" src={avatar} alt={member.name} />

            <div className="member-app-profile-main">
              <div className="member-app-profile-copy">
                <h1>
                  {member.name}
                  {/* <BadgeCheck className="member-app-verified" size={27} /> */}
                </h1>
                <p className="member-app-username">@{memberHandle}</p>

                {interests.length > 0 && (
                  <div className="member-app-interests">
                    {interests.slice(0, 4).map((interest) => (
                      <span key={interest}>{interest}</span>
                    ))}
                  </div>
                )}

                <div className="member-app-bio">
                  <p>{bio}</p>
                </div>

                {socialLinks.length > 0 && (
                  <div className="member-app-socials" aria-label="Profile links">
                    {socialLinks.map((link) => (
                      <a
                        key={link.key}
                        href={link.href}
                        target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                        rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                        aria-label={link.label}
                        title={link.label}
                      >
                        {link.icon}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              <div className="member-app-profile-side">
                <div className="member-app-stats" aria-label="Member stats">
                  <div>
                    <strong>{compactNumber(friendCount)}</strong>
                    <span>Friends</span>
                  </div>
                  <div>
                    <strong>{compactNumber(profilePosts.length)}</strong>
                    <span>Posts</span>
                  </div>
                  <div>
                    <strong>{compactNumber(totalLikes)}</strong>
                    <span>Likes</span>
                  </div>
                </div>

                <div className="member-app-actions">
                  {friendStatus === 'me' ? (
                    <Link className="member-app-follow" href="/dashboard">
                      Edit Profile
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="member-app-follow"
                      onClick={handleFriendAction}
                      disabled={busy}
                    >
                      {busy ? '...' : friendButtonLabel(friendStatus)}
                    </button>
                  )}
                  {/* {emailHref && (
                    <a className="member-app-email-action" href={emailHref} aria-label={`Email ${member.name}`}>
                      <Mail size={27} />
                    </a>
                  )} */}
                </div>
              </div>
            </div>
          </section>

          <nav className="member-app-tabs" aria-label="Profile sections">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                className={activeTab === tab.key ? 'active' : ''}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          <section className="member-app-tab-panel">
            {activeTab === 'posts' && (
              profilePosts.length > 0 ? (
                <div className="member-app-content-layout">
                  {featuredPost && (
                    <article className="member-app-feature-card">
                      <span className="member-app-section-label">Featured Post</span>
                      <Link className="member-app-feature-image" href={activityHref(featuredPost)}>
                        <img src={activityImage(featuredPost) || cover} alt={featuredPost.text} />
                        <div>
                          <h2>{featuredPost.text}</h2>
                          <span>{formatCardDate(featuredPost.createdAt)}</span>
                        </div>
                      </Link>
                    </article>
                  )}

                  <div className="member-app-latest">
                    <div className="member-app-latest-head">
                      <h2>Latest Posts</h2>
                      <button type="button" onClick={() => setActiveTab('posts')}>
                        See All <ArrowRight size={18} />
                      </button>
                    </div>
                    <div className="member-app-latest-grid">
                      {(latestPosts.length ? latestPosts : profilePosts).slice(0, 5).map((post) => (
                        <Link className="member-app-mini-card" href={activityHref(post)} key={post._id ?? `${post.actorHandle}-${post.createdAt}-${post.text}`}>
                          <img src={activityImage(post) || avatar} alt="" />
                          <h3>{post.text}</h3>
                          <span>{formatCardDate(post.createdAt)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="member-app-empty">No posts yet.</div>
              )
            )}

            {activeTab === 'articles' && (
              memberArticles.length > 0 ? (
                <div className="member-app-content-layout">
                  {featuredArticle && (
                    <article className="member-app-feature-card">
                      <span className="member-app-section-label">Featured Article</span>
                      <Link className="member-app-feature-image" href={`/blog/${featuredArticle.slug}`}>
                        <img src={featuredArticle.image || cover} alt={featuredArticle.title} />
                        <div>
                          <h2>{featuredArticle.title}</h2>
                          <span>{formatCardDate(featuredArticle.publishedAt ?? featuredArticle.approvedAt ?? featuredArticle.submittedAt)}</span>
                        </div>
                      </Link>
                    </article>
                  )}

                  <div className="member-app-latest">
                    <div className="member-app-latest-head">
                      <h2>Latest Articles</h2>
                      <Link href="/blog">
                        See All <ArrowRight size={18} />
                      </Link>
                    </div>
                    <div className="member-app-latest-grid">
                      {(latestArticles.length ? latestArticles : memberArticles).slice(0, 5).map((article) => (
                        <Link className="member-app-mini-card" href={`/blog/${article.slug}`} key={article.slug}>
                          <img src={article.image || cover} alt="" />
                          <h3>{article.title}</h3>
                          <span>{formatCardDate(article.publishedAt ?? article.approvedAt ?? article.submittedAt)}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="member-app-empty">No articles yet.</div>
              )
            )}

            {activeTab === 'friends' && (
              profileFriends.length > 0 ? (
                <div className="member-app-card-grid">
                  {profileFriends.map((friend) => (
                    <Link className="member-app-person-card" href={`/members/${friend.handle}`} key={friend._id}>
                      <img src={friend.avatar || FALLBACK_AVATAR} alt={friend.name} />
                      <div>
                        <h3>{friend.name}</h3>
                        <span>@{normalizeHandle(friend.handle)}</span>
                      </div>
                      {friend.bio && <p>{friend.bio}</p>}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="member-app-empty">
                  {canViewFriends ? 'No friends yet.' : 'Friends list is private.'}
                </div>
              )
            )}

            {activeTab === 'groups' && (
              profileGroups.length > 0 ? (
                <div className="member-app-card-grid">
                  {profileGroups.map((group) => (
                    <Link className="member-app-group-card" href={`/circles/${group.slug}`} key={group._id ?? group.slug}>
                      <img src={group.profilePicture || group.image || group.coverPhoto || FALLBACK_COVER} alt={group.name} />
                      <div>
                        <h3>{group.name}</h3>
                        <span>{compactNumber(group.membersCount ?? group.members?.length ?? 0)} members</span>
                      </div>
                      {group.description && <p>{group.description}</p>}
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="member-app-empty">No groups yet.</div>
              )
            )}

            {activeTab === 'products' && (
              purchasedProducts.length > 0 ? (
                <div className="member-app-latest-grid member-app-products-grid">
                  {purchasedProducts.map((product) => {
                    const productCard = (
                      <>
                        <img src={product.image || FALLBACK_COVER} alt={product.name} />
                        <h3>{product.name}</h3>
                        <span className="member-app-product-meta">
                          {product.quantity > 1 ? `Purchased ${product.quantity} times` : 'Purchased'}
                          {product.lastPurchasedAt ? ` · ${formatCardDate(product.lastPurchasedAt)}` : ''}
                        </span>
                        {product.variationName && <span>{product.variationName}</span>}
                      </>
                    );

                    return product.slug ? (
                      <Link className="member-app-mini-card" href={`/shop/${product.slug}`} key={product.key}>
                        {productCard}
                      </Link>
                    ) : (
                      <div className="member-app-mini-card" key={product.key}>
                        {productCard}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="member-app-empty">
                  {canViewProducts ? 'No purchased products yet.' : 'Products are private.'}
                </div>
              )
            )}
          </section>
        </div>
      </main>
    </>
  );
}
