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
      { id: string; data: Partial<ProjectTask> }
    >({
      query: ({ id, data }) => ({
        url: `/task/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Task'],
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
