import { GraphQLClient, gql } from "graphql-request";
import type { VelogPost } from "./types.js";

const endpoint = "https://v2.velog.io/graphql";

const client = new GraphQLClient(endpoint, {
  headers: {
    "Content-Type": "application/json",
  },
});

const POSTS_QUERY = gql`
  query Posts($username: String!, $cursor: ID, $limit: Int!) {
    posts(username: $username, cursor: $cursor, limit: $limit) {
      id
      title
      url_slug
      released_at
      updated_at
      short_description
      tags
    }
  }
`;

interface PostsResponse {
  posts: Array<{
    id: string;
    title: string;
    url_slug: string;
    released_at: string;
    updated_at?: string;
    tags?: string[];
  }>;
}

const POST_QUERY = gql`
  query Post($username: String!, $url_slug: String!) {
    post(username: $username, url_slug: $url_slug) {
      id
      title
      body
      url_slug
      released_at
      updated_at
      tags
    }
  }
`;

interface PostResponse {
  post: {
    id: string;
    title: string;
    body: string;
    url_slug: string;
    released_at: string;
    updated_at?: string;
    tags?: string[];
  } | null;
}

export async function fetchPostList(
  username: string,
  cursor?: string,
  limit = 20,
): Promise<PostsResponse["posts"]> {
  const response = await client.request<PostsResponse>(POSTS_QUERY, {
    username,
    cursor: cursor ?? null,
    limit,
  });

  return response.posts;
}

export function mapPost(
  post: PostsResponse["posts"][number],
  username: string,
): Omit<VelogPost, "body"> {
  return {
    id: post.id,
    title: post.title,
    slug: post.url_slug,
    publishedAt: post.released_at,
    updatedAt: String(post.updated_at),
    tags: post.tags ?? [],
    url: `https://velog.io/@${username}/${post.url_slug}`,
  };
}

export async function fetchPost(
  username: string,
  slug: string,
): Promise<VelogPost> {
  const response = await client.request<PostResponse>(POST_QUERY, {
    username,
    url_slug: slug,
  });

  if (!response.post) {
    throw new Error(`게시물을 찾을 수 없습니다: ${slug}`);
  }

  const post = response.post;

  return {
    id: post.id,
    title: post.title,
    slug: post.url_slug,
    body: post.body,
    publishedAt: post.released_at,
    updatedAt: String(post.updated_at),
    tags: post.tags ?? [],
    url: `https://velog.io/@${username}/${post.url_slug}`,
  };
}
