import type { User } from '../../types';
import { baseApi } from './baseApi';
import { setCredentials } from '../slides/auth/authSlide';
import { updateUserLocal } from '../slides/user/userSlide';
import { updateAssigneeAvatarLocal } from '../slides/task/taskSlide';

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
          const { user } = data;
          // Cập nhật Redux authSlide
          dispatch(setCredentials({ user }));
          // Cập nhật Redux userSlide
          dispatch(updateUserLocal(user));
          // Cập nhật avatar của assignees trong tasks
          if (user.avatar) {
            dispatch(
              updateAssigneeAvatarLocal({
                userId: user._id || user.id || '',
                avatar: user.avatar,
              }),
            );
          }
        } catch (error) {
          console.error('Failed to update avatar:', error);
        }
      },
    }),
  }),
});

export const { useUpdateAvatarMutation } = userApi;
