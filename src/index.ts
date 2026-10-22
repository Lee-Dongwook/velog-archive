import path from "node:path";
import { fetchPost, fetchPostList, mapPost } from "./velog.js";
import { serializePost } from "./markdown.js";
import { savePost } from "./storage.js";
import type { VelogPost, SyncResult } from "./types.js";

const username = process.env.VELOG_USERNAME;

if (!username) {
  console.error("VELOG_USERNAME 환경 변수를 설정하세요.");
  process.exitCode = 1;
} else {
  await main(username);
}

async function main(username: string): Promise<void> {
  const result: SyncResult = {
    discovered: 0,
    created: 0,
    updated: 0,
    unchanged: 0,
    failed: 0,
  };

  const seen = new Set<string>();
  let cursor: string | undefined;
  const limit = 20;

  try {
    while (true) {
      const posts = await fetchPostList(username, cursor, limit);

      if (posts.length === 0) {
        break;
      }

      for (const item of posts) {
        if (seen.has(item.id)) {
          throw new Error(`중복 게시물 ID 발견: ${item.id}`);
        }

        seen.add(item.id);
        result.discovered++;

        try {
          const post = await fetchPost(username, item.url_slug);

          const year = new Date(post.publishedAt).getFullYear();

          if (!Number.isFinite(year)) {
            throw new Error(`잘못된 게시일: ${post.publishedAt}`);
          }

          const filename = `${post.slug}--${post.id}.md`;
          const filePath = path.join(
            process.cwd(),
            "posts",
            String(year),
            filename,
          );

          const status = await savePost(filePath, serializePost(post));

          result[status]++;
        } catch (error) {
          result.failed++;
          console.error(`게시물 처리 실패: ${item.id}`, error);
        }
      }
    }

    console.table(result);

    if (result.failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("수집 작업 실패:", error);
    process.exitCode = 1;
  }
}
