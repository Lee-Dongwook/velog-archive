import path from "node:path";
import { fetchPost, fetchPostList } from "./velog.js";
import { serializePost } from "./markdown.js";
import { savePost } from "./storage.js";
import type { SyncResult } from "./types.js";

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

  const seenIds = new Set<string>();
  const seenCursors = new Set<string>();

  let cursor: string | undefined;
  let page = 0;
  const limit = 20;

  try {
    while (true) {
      page++;

      console.log(`페이지 ${page} 조회 중... cursor=${cursor ?? "START"}`);

      const posts = await fetchPostList(username, cursor, limit);

      if (posts.length === 0) {
        console.log("더 이상 게시물이 없습니다.");
        break;
      }

      let newPostsInPage = 0;

      for (const item of posts) {
        if (seenIds.has(item.id)) {
          console.warn(`[중복 게시물] id=${item.id}, title=${item.title}`);
          continue;
        }

        seenIds.add(item.id);
        newPostsInPage++;
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
          console.log(`[${status}] ${post.title}`);
        } catch (error) {
          result.failed++;
          console.error(`게시물 처리 실패: ${item.id}`, error);
        }
      }
      if (newPostsInPage === 0) {
        throw new Error(
          "새 게시물이 없는 페이지가 반환됐습니다. cursor 규칙을 확인하세요.",
        );
      }

      const nextCursor = posts[posts.length - 1]?.id;

      if (seenCursors.has(nextCursor!)) {
        throw new Error(`페이지네이션 cursor 반복: ${nextCursor}`);
      }

      seenCursors.add(nextCursor!);

      if (posts.length < limit) {
        break;
      }

      cursor = nextCursor;
    }

    console.log("\n수집 결과");
    console.table(result);

    if (result.failed > 0) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error("수집 작업 실패:", error);
    process.exitCode = 1;
  }
}
