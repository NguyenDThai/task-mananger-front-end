import type { ProjectTask } from '../../types';
import {
  addTaskLocal,
  updateTaskLocal,
  deleteTaskLocal,
  bulkDeleteLocal,
  appendTasks,
  setTasks,
} from '../slides/task/taskSlide';
import { baseApi } from './baseApi';

export interface Pagination {
  currentPage: number;
  totalTasks: number;
  hasMore: boolean;
}

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<
      {
        tasks: ProjectTask[];
        pagination: Pagination;
      },
      {
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => ({
        url: '/task',
        params: {
          page: params?.page || 1,
          limit: params?.limit || 20,
        },
      }),
      // Đồng bộ dữ liệu từ API về Redux Slide
      async onQueryStarted(params, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          if (!params || params.page === 1) {
            dispatch(setTasks(data.tasks));
          } else {
            dispatch(appendTasks(data.tasks));
          }
        } catch (error) {
          console.error('Failed to sync tasks:', error);
        }
      },
    }),

    getTaskStats: builder.query<Record<string, number>, void>({
      query: () => '/task/stats',
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
          // 1. Tự động đồng bộ vào Redux Slide cho UI đang hiển thị
          dispatch(addTaskLocal([newTask]));
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

        try {
          await queryFulfilled;
        } catch (error) {
          // Log lỗi nếu cần
          console.error('Failed to sync updated task:', error);
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
          console.error('Failed to sync deleted task:', error);
        }
      },
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
          console.error('Failed to sync bulk deleted tasks:', error);
        }
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskStatsQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useBulkDeleteTasksMutation,
} = taskApi;
