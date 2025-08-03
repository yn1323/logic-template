import { httpGet } from '../core/http-client';

// JSONPlaceholder Comment API response type
type CommentApiResponse = {
  postId: number;
  id: number;
  name: string;
  email: string;
  body: string;
};

// Processed comment data type for our application
type ProcessedComment = {
  id: number;
  postId: number;
  name: string;
  email: string;
  body: string;
  bodyPreview: string; // First 100 characters of body
};

const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Fetch all comments from JSONPlaceholder API
 */
export async function fetchComments() {
  const response = await httpGet<CommentApiResponse[]>(
    `${JSONPLACEHOLDER_BASE_URL}/comments`,
  );

  // Transform the raw API response to our processed format
  const processedComments = response.data.map(transformComment);

  return {
    ...response,
    data: processedComments,
  };
}

/**
 * Fetch comments by post ID from JSONPlaceholder API
 */
export async function fetchCommentsByPostId(postId: number) {
  const response = await httpGet<CommentApiResponse[]>(
    `${JSONPLACEHOLDER_BASE_URL}/comments?postId=${postId}`,
  );

  // Transform the raw API response to our processed format
  const processedComments = response.data.map(transformComment);

  return {
    ...response,
    data: processedComments,
  };
}

/**
 * Fetch a specific comment by ID from JSONPlaceholder API
 */
export async function fetchCommentById(commentId: number) {
  const response = await httpGet<CommentApiResponse>(
    `${JSONPLACEHOLDER_BASE_URL}/comments/${commentId}`,
  );

  // Transform the raw API response to our processed format
  const processedComment = transformComment(response.data);

  return {
    ...response,
    data: processedComment,
  };
}

/**
 * Transform raw comment API response to processed comment data
 */
function transformComment(rawComment: CommentApiResponse): ProcessedComment {
  return {
    id: rawComment.id,
    postId: rawComment.postId,
    name: rawComment.name,
    email: rawComment.email,
    body: rawComment.body,
    bodyPreview:
      rawComment.body.length > 100
        ? `${rawComment.body.substring(0, 100)}...`
        : rawComment.body,
  };
}

export type { CommentApiResponse, ProcessedComment };
