import matter from "gray-matter";
import type { VelogPost } from "./types.js";

export function serializePost(post: VelogPost): string {
  return matter.stringify(post.body, {
    title: post.title,
    slug: post.slug,
    velogId: post.id,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt ?? null,
    tags: post.tags,
    source: post.url,
  });
}
