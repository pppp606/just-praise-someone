import {
  handleError,
  handleServiceError,
  ErrorCode,
} from '../../utils/errorHandler';

describe('ErrorHandler', () => {
  describe('handleError', () => {
    const cases = [
      {
        code: ErrorCode.ValidationError,
        status: 400,
        message: 'Validation error',
      },
      { code: ErrorCode.Unauthorized, status: 401, message: 'Unauthorized' },
      { code: ErrorCode.NotFound, status: 404, message: 'Resource not found' },
      {
        code: ErrorCode.DuplicateError,
        status: 409,
        message: 'Duplicate entry',
      },
      {
        code: ErrorCode.UnknownError,
        status: 500,
        message: 'An unknown error occurred',
      },
    ];

    test.each(cases)(
      'エラーコード %p に対してステータスコード %p とメッセージ %p を返す',
      async ({ code, status, message }) => {
        const response = handleError(code);
        expect(response.status).toBe(status);
        expect(response.headers.get('Content-Type')).toBe('application/json');
        const body = await response.text();
        expect(body).toEqual(JSON.stringify({ error: message }));
      }
    );
  });

  describe('handleServiceError', () => {
    describe('引数が ServiceClassThrowError の場合', () => {
      test('指定されたcodeとmessageを返す', async () => {
        const response = handleServiceError({
          code: ErrorCode.ValidationError,
          message: 'Custom validation error',
        });
        expect(response.status).toBe(400);
        expect(response.headers.get('Content-Type')).toBe('application/json');
        const body = await response.text();
        expect(body).toEqual(
          JSON.stringify({ error: 'Custom validation error' })
        );
      });
    });

    describe('引数が ServiceClassThrowError でない場合', () => {
      test('UnknownError を返す', async () => {
        const response = handleServiceError({});
        expect(response.status).toBe(500);
        expect(response.headers.get('Content-Type')).toBe('application/json');
        const body = await response.text();
        expect(body).toEqual(
          JSON.stringify({ error: 'An unknown error occurred' })
        );
      });
    });
  });
});
