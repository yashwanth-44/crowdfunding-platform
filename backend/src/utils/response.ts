export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  data?: T;
  message: string;
  timestamp: string;
  path?: string;
}

export function successResponse<T>(
  data: T,
  message = 'Success',
  statusCode = 200
): ApiResponse<T> {
  return {
    success: true,
    statusCode,
    data,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  message: string,
  statusCode = 500,
  path?: string
): ApiResponse {
  return {
    success: false,
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path,
  };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
  message = 'Success'
) {
  return {
    success: true,
    statusCode: 200,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    message,
    timestamp: new Date().toISOString(),
  };
}
