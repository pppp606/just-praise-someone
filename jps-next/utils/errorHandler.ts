export enum ErrorCode {
  NotFound = 'notFound',
  ValidationError = 'validationError',
  UnknownError = 'unknownError',
  DuplicateError = 'duplicateError',
  Unauthorized = 'unauthorized',
}

export type ServiceClassThrowError = {
  code: ErrorCode;
  message?: string;
};

const jsonErrResponse = (message: string, status: number): Response => {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
};

export const handleServiceError = (error: unknown): Response => {
  const { code = ErrorCode.UnknownError, message = undefined } =
    error as ServiceClassThrowError;
  return handleError(code, message);
};

export const handleError = (code: ErrorCode, message?: string): Response => {
  const defaultMessages = {
    [ErrorCode.NotFound]: 'Resource not found',
    [ErrorCode.ValidationError]: 'Validation error',
    [ErrorCode.DuplicateError]: 'Duplicate entry',
    [ErrorCode.UnknownError]: 'An unknown error occurred',
    [ErrorCode.Unauthorized]: 'Unauthorized',
  };

  const errorMessage = message || defaultMessages[code] || 'An error occurred';

  switch (code) {
    case ErrorCode.ValidationError:
      return jsonErrResponse(errorMessage, 400);
    case ErrorCode.Unauthorized:
      return jsonErrResponse(errorMessage, 401);
    case ErrorCode.NotFound:
      return jsonErrResponse(errorMessage, 404);
    case ErrorCode.DuplicateError:
      return jsonErrResponse(errorMessage, 409);
    case ErrorCode.UnknownError:
    default:
      return jsonErrResponse(errorMessage, 500);
  }
};
