import type { User } from '../../types';
import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // login api
    login: builder.mutation({
      query: (data) => ({
        url: '/auth/login',
        method: 'POST',
        body: data,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/auth/register',
        method: 'POST',
        body: data,
      }),
    }),
    // Lấy thông tin của chính mình
    getMe: builder.query<{ user: User }, void>({
      query: () => ({
        url: '/auth/me',
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    // fetch tất cả thông tin của user
    getUsers: builder.query<{ users: User[] }, void>({
      query: () => ({
        url: '/auth/users',
      }),
    }),
    // update avatar
    updateAvatar: builder.mutation<
      { message: string; user: User },
      { userId: string; file: FormData }
    >({
      query: ({ userId, file }) => ({
        url: `/auth/update-avatar/${userId}`,
        method: 'POST',
        body: file,
      }),
      async onQueryStarted(_, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (error) {
          console.error('Failed to update avatar:', error);
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  useGetUsersQuery,
  useUpdateAvatarMutation,
} = authApi;
