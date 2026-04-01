import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { ProjectTask } from '../../types';

export const taskApi = createApi({
  reducerPath: 'taskApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    prepareHeaders: (headers) => {
      // In case we need it, but auth middleware handles it through cookies
      return headers;
    },
  }),
  tagTypes: ['Task'],
  endpoints: (builder) => ({
    getTasks: builder.query<{ tasks: ProjectTask[] }, void>({
      query: () => ({
        url: '/task',
        credentials: 'include', // Essential for cookie-based auth
      }),
      providesTags: ['Task'],
    }),
    createTask: builder.mutation<ProjectTask, Partial<ProjectTask>>({
      query: (data) => ({
        url: '/task',
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['Task'],
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation } = taskApi;
