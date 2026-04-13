import type { User } from '../../types';
import { baseApi } from './baseApi';
import { setCredentials } from '../slides/auth/authSlide';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Cập nhật Redux state với user mới
          dispatch(setCredentials({ user: data.user }));
        } catch (error) {
          console.error('Failed to update avatar:', error);
        }
      },
    }),
  }),
});

export const { useUpdateAvatarMutation } = userApi;
