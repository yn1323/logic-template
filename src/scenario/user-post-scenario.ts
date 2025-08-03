import { logger } from '../core/logger';
import { fetchComments, type ProcessedComment } from '../service/comment';
import { fetchPosts, type ProcessedPost } from '../service/post';
import { fetchUsers, type ProcessedUser } from '../service/user';

// Combined data type for the validation scenario
type CombinedUserData = {
  user: {
    id: number;
    name: string;
    email: string;
    username: string;
    city: string;
    company: string;
  };
  posts: {
    id: number;
    title: string;
    body: string;
    titlePreview: string;
    bodyPreview: string;
    commentsCount: number;
    comments: {
      id: number;
      name: string;
      email: string;
      bodyPreview: string;
    }[];
  }[];
  totalPosts: number;
  totalComments: number;
  averageCommentsPerPost: number;
};

// Execution result type for the scenario
type ScenarioExecutionResult = {
  success: boolean;
  data?: CombinedUserData[];
  error?: string;
  executionTime: number;
  apiCallsCount: number;
  processedUsersCount: number;
  processedPostsCount: number;
  processedCommentsCount: number;
};

/**
 * Execute the user-post validation scenario
 * This scenario demonstrates combining data from multiple APIs:
 * 1. Fetch all users
 * 2. Fetch all posts
 * 3. Fetch all comments
 * 4. Combine and process the data to create a comprehensive user profile
 */
export async function executeUserPostScenario(): Promise<ScenarioExecutionResult> {
  const startTime = Date.now();
  let apiCallsCount = 0;

  try {
    logger.info('Starting user-post validation scenario...');

    // Parallel API calls for better performance
    logger.info('Fetching data from multiple APIs in parallel...');
    const [usersResponse, postsResponse, commentsResponse] = await Promise.all([
      fetchUsers(),
      fetchPosts(),
      fetchComments(),
    ]);

    apiCallsCount = 3;

    logger.info(
      `Fetched ${usersResponse.data.length} users in ${usersResponse.executionTime}ms`,
    );
    logger.info(
      `Fetched ${postsResponse.data.length} posts in ${postsResponse.executionTime}ms`,
    );
    logger.info(
      `Fetched ${commentsResponse.data.length} comments in ${commentsResponse.executionTime}ms`,
    );

    // Combine and process the data
    logger.info('Processing and combining data...');
    const combinedData = combineUserPostData(
      usersResponse.data,
      postsResponse.data,
      commentsResponse.data,
    );

    const executionTime = Date.now() - startTime;

    logger.info(`Scenario completed successfully in ${executionTime}ms`);
    logger.info(`Processed ${combinedData.length} users with combined data`);

    return {
      success: true,
      data: combinedData,
      executionTime,
      apiCallsCount,
      processedUsersCount: usersResponse.data.length,
      processedPostsCount: postsResponse.data.length,
      processedCommentsCount: commentsResponse.data.length,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    logger.error(`Scenario failed after ${executionTime}ms: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
      executionTime,
      apiCallsCount,
      processedUsersCount: 0,
      processedPostsCount: 0,
      processedCommentsCount: 0,
    };
  }
}

/**
 * Combine user, post, and comment data into a comprehensive data structure
 * This function demonstrates data combination and selection logic
 */
function combineUserPostData(
  users: ProcessedUser[],
  posts: ProcessedPost[],
  comments: ProcessedComment[],
): CombinedUserData[] {
  logger.info('Starting data combination process...');

  // Create a map for faster comment lookup by postId
  const commentsByPostId = new Map<number, ProcessedComment[]>();
  comments.forEach((comment) => {
    const postComments = commentsByPostId.get(comment.postId) || [];
    postComments.push(comment);
    commentsByPostId.set(comment.postId, postComments);
  });

  // Create a map for faster post lookup by userId
  const postsByUserId = new Map<number, ProcessedPost[]>();
  posts.forEach((post) => {
    const userPosts = postsByUserId.get(post.userId) || [];
    userPosts.push(post);
    postsByUserId.set(post.userId, userPosts);
  });

  // Combine data for each user
  const combinedData: CombinedUserData[] = users.map((user) => {
    const userPosts = postsByUserId.get(user.id) || [];

    // Process posts with their comments
    const processedPosts = userPosts.map((post) => {
      const postComments = commentsByPostId.get(post.id) || [];

      // Transform comments to include only necessary data
      const transformedComments = postComments.map((comment) => ({
        id: comment.id,
        name: comment.name,
        email: comment.email,
        bodyPreview: comment.bodyPreview,
      }));

      return {
        id: post.id,
        title: post.title,
        body: post.body,
        titlePreview: post.titlePreview,
        bodyPreview: post.bodyPreview,
        commentsCount: postComments.length,
        comments: transformedComments,
      };
    });

    // Calculate aggregated statistics
    const totalPosts = processedPosts.length;
    const totalComments = processedPosts.reduce(
      (sum, post) => sum + post.commentsCount,
      0,
    );
    const averageCommentsPerPost =
      totalPosts > 0 ? totalComments / totalPosts : 0;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        city: user.city,
        company: user.company,
      },
      posts: processedPosts,
      totalPosts,
      totalComments,
      averageCommentsPerPost: Math.round(averageCommentsPerPost * 100) / 100, // Round to 2 decimal places
    };
  });

  // Log some statistics about the combination process
  const totalProcessedPosts = combinedData.reduce(
    (sum, userData) => sum + userData.totalPosts,
    0,
  );
  const totalProcessedComments = combinedData.reduce(
    (sum, userData) => sum + userData.totalComments,
    0,
  );

  logger.info('Data combination completed:');
  logger.info(`- Users processed: ${combinedData.length}`);
  logger.info(`- Posts processed: ${totalProcessedPosts}`);
  logger.info(`- Comments processed: ${totalProcessedComments}`);

  // Sort users by total posts (descending) for better presentation
  return combinedData.sort((a, b) => b.totalPosts - a.totalPosts);
}

/**
 * Execute a focused scenario for a specific user
 * This demonstrates targeted data selection and combination
 */
export async function executeUserFocusedScenario(
  userId: number,
): Promise<ScenarioExecutionResult> {
  const startTime = Date.now();
  let apiCallsCount = 0;

  try {
    logger.info(`Starting focused scenario for user ID: ${userId}...`);

    // Import specific user functions
    const { fetchUserById } = await import('../service/user');
    const { fetchPostsByUserId } = await import('../service/post');

    // Fetch user and their posts in parallel
    const [userResponse, postsResponse] = await Promise.all([
      fetchUserById(userId),
      fetchPostsByUserId(userId),
    ]);

    apiCallsCount = 2;

    // Fetch comments for all user's posts
    const commentPromises = postsResponse.data.map((post) =>
      import('../service/comment').then(({ fetchCommentsByPostId }) =>
        fetchCommentsByPostId(post.id),
      ),
    );

    const commentResponses = await Promise.all(commentPromises);
    apiCallsCount += commentPromises.length;

    // Flatten comments from all posts
    const allComments = commentResponses.flatMap((response) => response.data);

    logger.info('Focused scenario data fetched:');
    logger.info(`- User: ${userResponse.data.name}`);
    logger.info(`- Posts: ${postsResponse.data.length}`);
    logger.info(`- Comments: ${allComments.length}`);

    // Combine data for the specific user
    const combinedData = combineUserPostData(
      [userResponse.data],
      postsResponse.data,
      allComments,
    );

    const executionTime = Date.now() - startTime;

    logger.info(
      `Focused scenario completed successfully in ${executionTime}ms`,
    );

    return {
      success: true,
      data: combinedData,
      executionTime,
      apiCallsCount,
      processedUsersCount: 1,
      processedPostsCount: postsResponse.data.length,
      processedCommentsCount: allComments.length,
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    logger.error(
      `Focused scenario failed after ${executionTime}ms: ${errorMessage}`,
    );

    return {
      success: false,
      error: errorMessage,
      executionTime,
      apiCallsCount,
      processedUsersCount: 0,
      processedPostsCount: 0,
      processedCommentsCount: 0,
    };
  }
}

export type { CombinedUserData, ScenarioExecutionResult };
