import Link from "next/link";
import Image from "next/image";
import styles from "./blogs.module.css";
export default function BlogCard({ post, image }) {
  return <article className={styles.card}>
    <Link href={`/blogs/${post.slug}`} className={styles.cardImage} tabIndex={-1} aria-hidden="true"><Image src={image} alt="" fill sizes="(max-width: 600px) 90vw, (max-width: 1050px) 45vw, 30vw" /></Link>
    <div className={styles.cardCopy}>
      <span className={styles.tag}>{post.category}</span>
      <h2><Link href={`/blogs/${post.slug}`}>{post.title}</Link></h2>
      <p>{post.excerpt}</p>
      <div className={styles.cardMeta}><span>{post.readMinutes} min read</span><Link href={`/blogs/${post.slug}`}>Read article <span aria-hidden="true">↗</span></Link></div>
    </div>
  </article>;
}
