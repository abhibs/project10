import { BLOG_PAGE_SIZE } from "@/lib/seo-indexing.mjs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { publishedBlogs, blogImages, blogImage } from "@/lib/blogs";
import BlogCard from "./BlogCard";
import styles from "./blogs.module.css";

export const dynamic = "force-dynamic";
export async function generateMetadata({ searchParams }) {
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  return { title: `${page > 1 ? `Page ${page} | ` : ""}Gold Guides & Insights | Aryan Gold Buyers`, description: "Practical guides to selling gold, understanding purity and weights, gold rates and pledged gold. Read the Aryan Gold Buyers knowledge centre.", alternates: { canonical: page > 1 ? `/blogs?page=${page}` : "/blogs" }, ...(query.q || query.category ? { robots: { index: false, follow: true } } : {}) };
}
export default async function BlogsPage({ searchParams }) {
  const query = await searchParams;
  const search = typeof query.q === "string" ? query.q.trim().slice(0, 200) : "";
  const category = typeof query.category === "string" ? query.category : "";
  const [posts, images] = await Promise.all([publishedBlogs(), blogImages()]);
  const categories = [...new Set(posts.map(post => post.category))].sort();
  const filtered = posts.filter(post => (!category || post.category === category) && (!search || `${post.title} ${post.excerpt}`.toLowerCase().includes(search.toLowerCase())));
  const pages = Math.max(1, Math.ceil(filtered.length / BLOG_PAGE_SIZE));
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  if (page > pages) notFound();
  const start = (page - 1) * BLOG_PAGE_SIZE;
  const href = (nextPage, nextCategory = category) => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (nextCategory) params.set("category", nextCategory);
    if (nextPage > 1) params.set("page", String(nextPage));
    return `/blogs${params.size ? `?${params}` : ""}`;
  };
  return <div className={styles.page}><div className={styles.shell}>
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span aria-current="page">Journal</span></nav>
    <header className={styles.intro}><div><span className={styles.eyebrow}>THE ARYAN GOLD JOURNAL</span><h1>Gold guides<br /><em>& insights.</em></h1><p>Understand your gold before you sell.<br />Explore purity, valuation, weights and more.</p></div><div className={styles.introNote}><span aria-hidden="true">✦</span><p>Knowledge for<br />your next step.</p></div></header>
    <div className={styles.listLayout}>
      <section aria-labelledby="articles-heading">
        <div className={styles.listHeading}><h2 id="articles-heading">{category || "All articles"}</h2><span>{filtered.length ? `Showing ${start + 1}–${Math.min(start + BLOG_PAGE_SIZE, filtered.length)} of ${filtered.length} articles` : "No matching articles"}</span></div>
        {filtered.length ? <div className={styles.grid}>{filtered.slice(start, start + BLOG_PAGE_SIZE).map(post => <BlogCard key={post.slug} post={post} image={blogImage(post, images)} />)}</div> : <div className={styles.empty}><h3>{posts.length ? "No articles found" : "Articles coming soon"}</h3><p>{posts.length ? "Try a different search or browse all topics." : "Our gold guides will be available here soon."}</p><Link href={posts.length ? "/blogs" : "/contact-us"}>{posts.length ? "View all articles →" : "Contact our team →"}</Link></div>}
        {pages > 1 && <nav className={styles.pagination} aria-label="Article pages">{page > 1 && <Link href={href(page - 1)} rel="prev">← Previous</Link>}<span>Page {page} of {pages}</span>{page < pages && <Link href={href(page + 1)} rel="next">Next →</Link>}</nav>}
      </section>
      <aside className={styles.sidebar}>
        <form action="/blogs" className={styles.search}><label htmlFor="blog-search">Find an article</label><div><input id="blog-search" name="q" defaultValue={search} placeholder="Search the journal…" type="search" />{category && <input type="hidden" name="category" value={category} />}<button aria-label="Search articles">↗</button></div></form>
        <div className={styles.topics}><span className={styles.eyebrow}>BROWSE TOPICS</span><h2>A guide for<br />every question.</h2><nav aria-label="Article topics"><Link href={href(1, "")} aria-current={!category ? "page" : undefined}>All articles <span>{posts.length}</span></Link>{categories.map(name => <Link key={name} href={href(1, name)} aria-current={category === name ? "page" : undefined}>{name}<span>{posts.filter(post => post.category === name).length}</span></Link>)}</nav></div>
        <div className={styles.help}><span className={styles.eyebrow}>LET’S TALK GOLD</span><h3>Your questions.<br />Our attention.</h3><p>Speak to our team about your gold or plan a branch visit.</p><Link href="/contact-us">Get in touch ↗</Link></div>
      </aside>
    </div>
  </div></div>;
}
