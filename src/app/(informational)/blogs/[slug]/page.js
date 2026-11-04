import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { findBlog, publishedBlogs, blogImages, blogImage } from "@/lib/blogs";
import { SITE_URL, jsonLd } from "@/lib/site-seo.mjs";
import ServiceForm from "../../services/ServiceForm";
import BlogCard from "../BlogCard";
import styles from "../blogs.module.css";

export const dynamic = "force-dynamic";
async function resolve(params) {
  const post = await findBlog((await params).slug);
  if (!post || post.status !== "published") notFound();
  return post;
}
export async function generateMetadata({ params }) {
  const post = await resolve(params);
  const image = blogImage(post, await blogImages());
  return { title: post.metaTitle, description: post.description, keywords: post.source.keywords.map(item => item.keyword), alternates: { canonical: `/blogs/${post.slug}` }, openGraph: { type: "article", title: post.title, description: post.description, url: `/blogs/${post.slug}`, images: [image] } };
}
export default async function ArticlePage({ params }) {
  const post = await resolve(params);
  const images = await blogImages();
  const related = (await publishedBlogs()).filter(item => item.slug !== post.slug && item.category === post.category).slice(0, 3);
  const url = `${SITE_URL}/blogs/${post.slug}`;
  const schema = { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": `${SITE_URL}#organization`, name: "Aryan Gold Buyers", url: SITE_URL },
    { "@type": "Article", "@id": `${url}#article`, headline: post.title, description: post.description, mainEntityOfPage: url, image: new URL(blogImage(post, images), SITE_URL).href, publisher: { "@id": `${SITE_URL}#organization` }, articleSection: post.category, inLanguage: "en-IN" },
    { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Home", item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Journal", item: `${SITE_URL}/blogs` }, { "@type": "ListItem", position: 3, name: post.title, item: url }] },
  ] };
  return <div className={styles.page}><div className={styles.articleShell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(schema) }} />
    <nav className={styles.breadcrumb} aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/blogs">Journal</Link><span>/</span><span aria-current="page">{post.category}</span></nav>
    <div className={styles.articleLayout}>
      <aside className={styles.toc}><span className={styles.eyebrow}>IN THIS ARTICLE</span><nav aria-label="Table of contents">{post.headings.slice(0, 18).map(heading => <a href={`#${heading.id}`} key={heading.id}>{heading.title}</a>)}<a href="#article-next-step">Your next step</a></nav><Link className={styles.back} href="/blogs">← Back to the journal</Link></aside>
      <div className={styles.articleCenter}>
        <article className={styles.article}>
          <span className={styles.eyebrow}>{post.category}</span><h1>{post.title}</h1><p className={styles.standfirst}>{post.excerpt}</p><div className={styles.byline}><span>By Aryan Gold Buyers</span><span>{post.readMinutes} min read</span></div>
          <div className={styles.heroImage}><Image src={blogImage(post, images)} alt={post.title} fill sizes="(max-width: 800px) 90vw, (max-width: 1200px) 65vw, 55vw" priority /></div>
          <p className={styles.rateNote}>Rates and calculations in this guide are illustrative. <Link href="/gold-rate">Check our published rates</Link> and confirm your offer after physical evaluation.</p>
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: post.html }} />
          <section id="article-next-step" className={styles.articleCta}><span className={styles.eyebrow}>YOUR NEXT STEP</span><h2>Let’s talk about<br />your gold.</h2><p>Get a personal valuation and understand your offer before deciding to sell.</p><div><a href="tel:+919117125555">Call +91 9117 125 555 ↗</a><Link href="/branches">Find a branch →</Link></div></section>
        </article>
        {related.length > 0 && <section className={styles.related}><span className={styles.eyebrow}>CONTINUE READING</span><h2>A little more insight.</h2><div className={styles.relatedGrid}>{related.map(item => <BlogCard key={item.slug} post={item} image={blogImage(item, images)} />)}</div></section>}
      </div>
      <div className={styles.valuation}><ServiceForm service="sell-gold" /></div>
    </div>
  </div></div>;
}
