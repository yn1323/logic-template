import { httpGet } from '../core/http-client';

// JSONPlaceholder Post API response type
type PostApiResponse = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

// Processed post data type for our application
type ProcessedPost = {
  id: number;
  userId: number;
  title: string;
  body: string;
  titlePreview: string; // First 50 characters of title
  bodyPreview: string; // First 100 characters of body
};

const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Fetch all posts from JSONPlaceholder API
 */
export async function fetchPosts() {
  const response = await httpGet<PostApiResponse[]>(
    `${JSONPLACEHOLDER_BASE_URL}/posts`,
  );

  // Transform the raw API response to our processed format
  const processedPosts = response.data.map(transformPost);

  return {
    ...response,
    data: processedPosts,
  };
}

/**
 * Fetch posts by user ID from JSONPlaceholder API
 */
export async function fetchPostsByUserId(userId: number) {
  const response = await httpGet<PostApiResponse[]>(
    `${JSONPLACEHOLDER_BASE_URL}/posts?userId=${userId}`,
  );

  // Transform the raw API response to our processed format
  const processedPosts = response.data.map(transformPost);

  return {
    ...response,
    data: processedPosts,
  };
}

/**
 * Fetch a specific post by ID from JSONPlaceholder API
 */
export async function fetchPostById(postId: number) {
  const response = await httpGet<PostApiResponse>(
    `${JSONPLACEHOLDER_BASE_URL}/posts/${postId}`,
  );

  // Transform the raw API response to our processed format
  const processedPost = transformPost(response.data);

  return {
    ...response,
    data: processedPost,
  };
}

/**
 * Transform raw post API response to processed post data
 */
function transformPost(rawPost: PostApiResponse): ProcessedPost {
  return {
    id: rawPost.id,
    userId: rawPost.userId,
    title: rawPost.title,
    body: rawPost.body,
    titlePreview:
      rawPost.title.length > 50
        ? `${rawPost.title.substring(0, 50)}...`
        : rawPost.title,
    bodyPreview:
      rawPost.body.length > 100
        ? `${rawPost.body.substring(0, 100)}...`
        : rawPost.body,
  };
}

export type { PostApiResponse, ProcessedPost };
