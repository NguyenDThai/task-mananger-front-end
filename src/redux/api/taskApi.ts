/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProjectTask } from '../../types';
import { env } from '../../config/configEnv';
import { addTaskLocal } from '../slides/task/taskSlide';

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
      // transformResponse để lấy dữ liệu task từ response của API
      transformResponse: (response: { task: ProjectTask }) => response.task,
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data: newTask } = await queryFulfilled;
          // Tự động đồng bộ vào Redux Slide bất cứ khi nào tạo task thành công
          dispatch(addTaskLocal([newTask]));
        } catch (err) {
          console.error('Failed to sync created task to Redux Slide:', err);
        }
      },
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
            let task = draft.tasks.find((t) => t._id === id);

            // Nếu không phải task cha thì tìm trong task con
            if (!task) {
              const parent = draft.tasks.find((t) =>
                t.subtasks?.some(
                  (st) => (typeof st === 'string' ? st : st._id) === id,
                ),
              );

              if (parent) {
                task = parent.subtasks?.find(
                  (st) => (typeof st === 'string' ? st : st._id) === id,
                );
              }
            }

            if (!task) return;

            // Cập nhật tất cả các trường dữ liệu
            Object.assign(
              task,
              Object.fromEntries(
                Object.entries(data).filter(
                  ([key]) => !['addAssignees', 'removeAssignees'].includes(key),
                ),
              ),
            );

            if (data.addAssignees) {
              task.assignees = Array.from(
                new Set([...(task.assignees || []), ...data.addAssignees]),
              );
            }

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
          await queryFulfilled;
        } catch (error) {
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
