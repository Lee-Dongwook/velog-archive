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
      slug
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
    slug: string;
    released_at: string;
    updated_at?: string;
    tags?: string[];
  }>;
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
    slug: post.slug,
    publishedAt: post.released_at,
    updatedAt: String(post.updated_at),
    tags: post.tags ?? [],
    url: `https://velog.io/@${username}/${post.slug}`,
  };
}
