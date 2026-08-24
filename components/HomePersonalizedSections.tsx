'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { FeaturedArticlesSection } from '@/components/FeaturedArticlesSection';
import { FeaturedCirclesSection } from '@/components/FeaturedCirclesSection';
import { ShopLatestSection } from '@/components/ShopLatestSection';
import { getArticles, getGroups, getMe, getProducts } from '@/lib/api';
import {
  filterArticlesByProfileCategories,
  filterGroupsByProfileSlugs,
  filterProductsByProfileCategories,
} from '@/lib/profile-personalization';
import type { DashboardUser } from '@/components/dashboard/types';
import type { Article, Group, Product } from '@/lib/types';

type HomePersonalizedSectionsProps = {
  products: Product[];
  articles: Article[];
  groups: Group[];
  children?: ReactNode;
};

function hasSelections(values?: string[] | null) {
  return Boolean(values?.some((value) => value.trim()));
}

export function HomePersonalizedSections({
  products: initialProducts,
  articles: initialArticles,
  groups: initialGroups,
  children,
}: HomePersonalizedSectionsProps) {
  const [profile, setProfile] = useState<DashboardUser | null>(null);
  const [products, setProducts] = useState(initialProducts);
  const [articles, setArticles] = useState(initialArticles);
  const [groups, setGroups] = useState(initialGroups);

  useEffect(() => {
    let mounted = true;

    try {
      if (!window.localStorage.getItem('asiance_token')) return;
    } catch {
      return;
    }

    Promise.all([getMe(), getProducts({ sort: 'latest' }), getArticles(), getGroups()])
      .then(([me, nextProducts, nextArticles, nextGroups]) => {
        if (!mounted) return;
        setProfile(me);
        setProducts(nextProducts);
        setArticles(nextArticles);
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
  const personalizedArticles = useMemo(
    () => filterArticlesByProfileCategories(articles, profile?.blogCategoryInterests),
    [articles, profile?.blogCategoryInterests],
  );
  const personalizedGroups = useMemo(
    () => filterGroupsByProfileSlugs(groups, profile?.communityCircleSlugs),
    [groups, profile?.communityCircleSlugs],
  );

  const hasProductPersonalization = hasSelections(profile?.productCategoryInterests);
  const hasArticlePersonalization = hasSelections(profile?.blogCategoryInterests);
  const hasGroupPersonalization = hasSelections(profile?.communityCircleSlugs);

  return (
    <>
      <ShopLatestSection
        products={personalizedProducts}
        title={hasProductPersonalization ? 'Products picked for you' : undefined}
      />

      <FeaturedArticlesSection
        articles={personalizedArticles}
        title={hasArticlePersonalization ? 'Articles picked for you' : undefined}
      />

      {children}

      <FeaturedCirclesSection
        groups={personalizedGroups}
        title={hasGroupPersonalization ? 'Your circles' : undefined}
      />
    </>
  );
}
