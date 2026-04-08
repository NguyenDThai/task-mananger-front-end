/* eslint-disable @typescript-eslint/no-unused-vars */
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProjectTask } from '../../types';
import { env } from '../../config/configEnv';
import {
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  bulkDeleteLocal,
  setTasks,
} from '../slides/task/taskSlide';

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
      // Đồng bộ dữ liệu từ API về Redux Slide
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setTasks(data.tasks));
        } catch (error) {
          console.error('Failed to sync tasks:', error);
        }
      },
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
          // 1. Tự động đồng bộ vào Redux Slide cho UI đang hiển thị
          dispatch(addTaskLocal([newTask]));

          // 2. Cập nhật cache thủ công cho RTK Query (chống xung đột khi sync lại)
          dispatch(
            taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
              if (newTask.parentTask) {
                const parent = draft.tasks.find(
                  (t) => (t._id || t.id) === newTask.parentTask,
                );
                if (parent) {
                  if (!parent.subtasks) parent.subtasks = [];
                  parent.subtasks.push(newTask);
                }
              } else {
                draft.tasks.push(newTask);
              }
            }),
          );
        } catch (err) {
          console.error('Failed to sync created task:', err);
        }
      },
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
        // 1. Cập nhật Redux Slide ngay lập tức cho UI
        dispatch(updateTaskLocal({ id, data }));

        // 2. Cập nhật cache ngay lap tuc cho RTK Query
        const patchResult = dispatch(
          taskApi.util.updateQueryData('getTasks', undefined, (draft) => {
            let task = draft.tasks.find((t) => (t._id || t.id) === id);

            // Nếu không phải task cha thì tìm trong task con
            if (!task) {
              const parent = draft.tasks.find((t) =>
                t.subtasks?.some(
                  (st) =>
                    (typeof st === 'string' ? st : st._id || st.id) === id,
                ),
              );

              if (parent) {
                task = parent.subtasks?.find(
                  (st) =>
                    (typeof st === 'string' ? st : st._id || st.id) === id,
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
              task.assignees = (task.assignees || []).filter((uid) => {
                const userId = typeof uid === 'string' ? uid : uid._id || '';
                return !data.removeAssignees?.includes(userId);
              });
            }
          }),
        );

        try {
          await queryFulfilled;
        } catch (error) {
          patchResult.undo();
          // Log lỗi nếu cần
        }
      },
    }),
    deleteTask: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/task/${id}`,
        method: 'DELETE',
      }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        // 1. Xóa trong Redux Slide ngay lập tức
        dispatch(deleteTaskLocal(id));

        try {
          await queryFulfilled;
        } catch (error) {
          // Nếu xóa lỗi thì ta phải fetch lại để đảm bảo dữ liệu đúng
          // (Dùng invalidatesTags ở đây là an toàn nhất để sửa lỗi)
        }
      },
      // invalidatesTags: ['Task'],
    }),
    bulkDeleteTasks: builder.mutation<{ message: string }, { ids: string[] }>({
      query: (data) => ({
        url: '/task/bulk-delete',
        method: 'POST',
        body: data,
      }),
      async onQueryStarted({ ids }, { dispatch, queryFulfilled }) {
        // 1. Xóa trong Redux Slide
        dispatch(bulkDeleteLocal(ids));

        try {
          await queryFulfilled;
        } catch (error) {
          // Log lỗi
        }
      },
      // invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useBulkDeleteTasksMutation,
} = taskApi;
