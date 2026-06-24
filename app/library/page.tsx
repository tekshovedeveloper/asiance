import { FileArchive, FileText, ImageIcon } from 'lucide-react';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getFiles } from '@/lib/api';

export default async function LibraryPage() {
  const files = await getFiles();

  return (
    <main>
      <SiteHeader active="Activity" />
      <section className="page-hero">
        <span className="eyebrow">library</span>
        <h1>
          files, docs, <em>media.</em>
        </h1>
        <p className="page-copy">A shared library for drafts, lookbooks, guides, and assets.</p>
      </section>
      <section className="library-shell">
        <div className="file-grid">
          {files.map((file) => (
            <article className="file-card" key={file.title}>
              <span className="file-type">{file.type}</span>
              {file.type === 'media' ? <ImageIcon /> : file.type === 'doc' ? <FileText /> : <FileArchive />}
              <h3>{file.title}</h3>
              <p>
                {file.category} · {file.size} · {file.ownerName}
              </p>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
