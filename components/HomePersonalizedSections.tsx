'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FeaturedArticlesSection } from '@/components/FeaturedArticlesSection';
import { FeaturedCirclesSection } from '@/components/FeaturedCirclesSection';
import { ShopLatestSection } from '@/components/ShopLatestSection';
import { getGroups, getMe, getProducts } from '@/lib/api';
import {
  filterGroupsByProfileSlugs,
  filterProductsByProfileCategories,
} from '@/lib/profile-personalization';
import type { DashboardUser } from '@/components/dashboard/types';
import type { ArticleCarousel, Group, Product } from '@/lib/types';

type HomePersonalizedSectionsProps = {
  products: Product[];
  articleCarousel: ArticleCarousel;
  groups: Group[];
  children?: ReactNode;
};

function hasSelections(values?: string[] | null) {
  return Boolean(values?.some((value) => value.trim()));
}

export function HomePersonalizedSections({
  products: initialProducts,
  articleCarousel,
  groups: initialGroups,
  children,
}: HomePersonalizedSectionsProps) {
  const [profile, setProfile] = useState<DashboardUser | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [groups, setGroups] = useState(initialGroups);

  useEffect(() => {
    let mounted = true;

    try {
      if (!window.localStorage.getItem('asiance_token')) return;
    } catch {
      return;
    }

    Promise.all([getMe(), getProducts({ sort: 'latest' }), getGroups()])
      .then(([me, nextProducts, nextGroups]) => {
        if (!mounted) return;
        setProfile(me);
        setProducts(nextProducts);
        setGroups(nextGroups);
      })
      .catch(() => {
        if (mounted) setProfile(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const personalizedProducts = useMemo(
    () => filterProductsByProfileCategories(products, profile?.productCategoryInterests),
    [products, profile?.productCategoryInterests],
  );
  const personalizedGroups = useMemo(
    () => filterGroupsByProfileSlugs(groups, profile?.communityCircleSlugs),
    [groups, profile?.communityCircleSlugs],
  );

  const hasProductPersonalization = hasSelections(profile?.productCategoryInterests);
  const hasGroupPersonalization = hasSelections(profile?.communityCircleSlugs);

  return (
    <>
      <ShopLatestSection
        products={personalizedProducts}
        title={hasProductPersonalization ? 'Products picked for you' : undefined}
      />

      <FeaturedArticlesSection
        articles={articleCarousel.articles}
        autoRotate={articleCarousel.autoRotate}
        rotationIntervalMs={articleCarousel.rotationIntervalMs}
        sectionKey="home"
      />

      {children}

      <FeaturedCirclesSection
        groups={personalizedGroups}
        title={hasGroupPersonalization ? 'Your circles' : undefined}
      />
    </>
  );
}
