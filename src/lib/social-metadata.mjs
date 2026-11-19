import { SITE_URL } from "./site-seo.mjs";

export function completeSocialMetadata(metadata) {
  const openGraph = {
    type: "website",
    siteName: "Aryan Gold Buyers",
    locale: "en_IN",
    images: [{ url: `${SITE_URL}/about-wall-sign.webp`, alt: "Aryan Gold Buyers reception" }],
    ...metadata.openGraph,
    title: metadata.openGraph?.title || metadata.title,
    description: metadata.openGraph?.description || metadata.description,
    url: metadata.alternates?.canonical || SITE_URL,
  };
  return { ...metadata, openGraph, twitter: {
    card: "summary_large_image", title: openGraph.title,
    description: openGraph.description, images: openGraph.images,
    ...metadata.twitter,
  } };
}
