import { httpGet } from '../core/http-client';

// JSONPlaceholder User API response type
type UserApiResponse = {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
};

// Processed user data type for our application
type ProcessedUser = {
  id: number;
  name: string;
  email: string;
  username: string;
  city: string;
  company: string;
};

const JSONPLACEHOLDER_BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Fetch all users from JSONPlaceholder API
 */
export async function fetchUsers() {
  const response = await httpGet<UserApiResponse[]>(
    `${JSONPLACEHOLDER_BASE_URL}/users`,
  );

  // Transform the raw API response to our processed format
  const processedUsers = response.data.map(transformUser);

  return {
    ...response,
    data: processedUsers,
  };
}

/**
 * Fetch a specific user by ID from JSONPlaceholder API
 */
export async function fetchUserById(userId: number) {
  const response = await httpGet<UserApiResponse>(
    `${JSONPLACEHOLDER_BASE_URL}/users/${userId}`,
  );

  // Transform the raw API response to our processed format
  const processedUser = transformUser(response.data);

  return {
    ...response,
    data: processedUser,
  };
}

/**
 * Transform raw user API response to processed user data
 */
function transformUser(rawUser: UserApiResponse): ProcessedUser {
  return {
    id: rawUser.id,
    name: rawUser.name,
    email: rawUser.email,
    username: rawUser.username,
    city: rawUser.address.city,
    company: rawUser.company.name,
  };
}

export type { ProcessedUser, UserApiResponse };
