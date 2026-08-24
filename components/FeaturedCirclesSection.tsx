import Link from 'next/link';
import { ArrowRight, LockKeyhole, UsersRound } from 'lucide-react';
import type { Group } from '@/lib/types';

type FeaturedCirclesSectionProps = {
  groups: Group[];
  title?: string;
  href?: string;
  linkLabel?: string;
};

export function FeaturedCirclesSection({
  groups,
  title = 'Featured circles',
  href = '/circles',
  linkLabel = 'View all circles',
}: FeaturedCirclesSectionProps) {
  const featuredGroups = [...groups]
    .sort((left, right) => {
      const leftIsGeneric = left.category.toLowerCase() === 'circle' ? 1 : 0;
      const rightIsGeneric = right.category.toLowerCase() === 'circle' ? 1 : 0;
      return leftIsGeneric - rightIsGeneric || right.membersCount - left.membersCount;
    })
    .slice(0, 4);

  if (!featuredGroups.length) return null;

  return (
    <section className="featured-circles-section" aria-labelledby="featured-circles-title">
      <div className="featured-circles-section__heading">
        <h2 id="featured-circles-title">{title}</h2>
        <Link href={href} className="featured-circles-section__all">
          {linkLabel}
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>

      <div className="featured-circles-list">
        {featuredGroups.map((group) => (
          <article className="featured-circle-card" key={group.slug}>
            <Link href={`/circles/${group.slug}`} className="featured-circle-card__link">
              <img src={group.coverPhoto || group.image} alt="" />
              <span className="featured-circle-card__scrim" aria-hidden="true" />
              <div className="featured-circle-card__content">
                <span>{group.category}</span>
                <h3>{group.name}</h3>
                <p>{group.description}</p>
                <div className="featured-circle-card__meta">
                  {group.privacy === 'private' ? (
                    <LockKeyhole size={13} aria-hidden="true" />
                  ) : (
                    <UsersRound size={14} aria-hidden="true" />
                  )}
                  <span>
                    {group.membersCount} {group.membersCount === 1 ? 'member' : 'members'}
                  </span>
                  <i aria-hidden="true" />
                  <span>{group.privacy} circle</span>
                </div>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
