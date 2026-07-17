import { MessageSquare } from 'lucide-react';
import { ActivityFeed } from '@/components/ActivityFeed';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getActivity, getArticle } from '@/lib/api';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function decodeBasicHtml(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&');
}

function textToParagraphHtml(value: string) {
  return value
    .trim()
    .split(/\n{2,}/)
    .map((paragraph) => `<p>${escapeHtml(paragraph.trim())}</p>`)
    .join('');
}

function accidentalCodeBlockToHtml(value: string) {
  const text = decodeBasicHtml(value)
    .replace(/<\/p>\s*<p>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(p|pre|code)>/gi, '')
    .replace(/<[^>]+>/g, '');

  return textToParagraphHtml(text);
}

function articleContentHtml(content: string) {
  const trimmed = content.trim();
  if (!trimmed) return '';

  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(trimmed);
  if (hasHtml) {
    const html = trimmed
      .replace(/<p>\s*<\/p>/gi, '')
      .replace(/<\/code><\/pre>\s*<pre><code>/gi, '\n\n');
    const accidentalCodeBlock = html.match(/^<pre><code>([\s\S]*)<\/code><\/pre>$/i);

    if (accidentalCodeBlock) {
      return accidentalCodeBlockToHtml(accidentalCodeBlock[1]);
    }

    return html;
  }

  return textToParagraphHtml(trimmed);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, activity] = await Promise.all([getArticle(slug), getActivity()]);
  const contentHtml = articleContentHtml(article.content || '');

  return (
    <main>
      <SiteHeader active="Blog" />
      <section className="article-hero">
        <span className="eyebrow">{article.category}</span>
        <h1 className="article-title">{article.title}</h1>
        <p className="page-copy-article" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
          {article.excerpt}
        </p>
      </section>
      <img className="article-image" src={article.image} alt={article.title} />
      <article className="article-body ql-editor">
        {contentHtml ? <div dangerouslySetInnerHTML={{ __html: contentHtml }} /> : null}
     
      </article>
 


      <SiteFooter />
    </main>
  );
}
