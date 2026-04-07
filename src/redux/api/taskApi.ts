/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProjectTask } from '../../types';
import { env } from '../../config/configEnv';

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl,
    prepareHeaders: (headers) => {
      // In case we need it, but auth middleware handles it through cookies
      return headers;
    },
    credentials: 'include',
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<{ tasks: ProjectTask[] }, void>({
      query: () => ({
        url: '/task',
      }),
      providesTags: ['Task'],
    }),
    createTask: builder.mutation<ProjectTask, Partial<ProjectTask>>({
      query: (data) => ({
        url: '/task',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation<
      ProjectTask,
      {
        id: string;
        data: Partial<ProjectTask> & {
          addAssignees?: string[];
          removeAssignees?: string[];
        };
      }
    >({
      query: ({ id, data }) => ({
        url: `/task/${id}`,
        method: 'PATCH',
        body: data,
      }),
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        // Update cache ngay lap tuc
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            const task = draft.tasks.find((t) => t._id === id);
            if (!task) return;

            if (data.name !== undefined) {
              task.name = data.name;
            }

            if (data.status !== undefined) {
              task.status = data.status;
            }

            // Update thêm người vào dự án
            if (data.addAssignees) {
              task.assignees = Array.from(
                new Set([...(task.assignees || []), ...data.addAssignees]),
              );
            }

            // Delete khỏi dự án
            if (data.removeAssignees) {
              task.assignees = (task.assignees || []).filter(
                (uid) =>
                  !data.removeAssignees?.includes(
                    typeof uid === 'string' ? uid : uid._id || '',
                  ),
              );
            }
          }),
        );

        try {
          // Nếu chỉnh sửa thành công thì giữ nguyên
          await queryFulfilled;
        } catch (error) {
          // Nếu api fail thì rollback về trạng thái cũ
          patchResult.undo();
        }
      },
    }),
    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/task/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = taskApi;
