import { handleError, handleServiceError, ErrorCode } from "../../utils/errorHandler";

describe("ErrorHandler", () => {
  describe("handleError", () => {
    test("should return correct response for ValidationError", async () => {
      const response = handleError(ErrorCode.ValidationError);
      expect(response.status).toBe(400);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.text();
      expect(body).toEqual(JSON.stringify({ error: "Validation error" }));
    });

    test("should return correct response for Unauthorized", async () => {
      const response = handleError(ErrorCode.Unauthorized);
      expect(response.status).toBe(401);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.text();
      expect(body).toEqual(JSON.stringify({ error: "Unauthorized" }));
    });


    test("should return correct response for NotFound", async () => {
      const response = handleError(ErrorCode.NotFound);
      expect(response.status).toBe(404);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.text();
      expect(body).toEqual(JSON.stringify({ error: "Resource not found" }));
    });

    test("should return correct response for DuplicateError", async () => {
      const response = handleError(ErrorCode.DuplicateError);
      expect(response.status).toBe(409);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.text();
      expect(body).toEqual(JSON.stringify({ error: "Duplicate entry" }));
    });

    test("should return correct response for UnknownError", async () => {
      const response = handleError(ErrorCode.UnknownError);
      expect(response.status).toBe(500);
      expect(response.headers.get("Content-Type")).toBe("application/json");
      const body = await response.text();
      expect(body).toEqual(JSON.stringify({ error: "An unknown error occurred" }));
    });
  });

  describe("handleServiceError", () => {
    describe("引数が ServiceClassThrowError の場合", () => {
      test("指定されたcodeとmessageを返す", async () => {
        const response = handleServiceError({ code: ErrorCode.ValidationError, message: "Custom validation error" });
        expect(response.status).toBe(400);
        expect(response.headers.get("Content-Type")).toBe("application/json");
        const body = await response.text();
        expect(body).toEqual(JSON.stringify({ error: "Custom validation error" }));
      });
    });

    describe("引数が ServiceClassThrowError でない場合", () => {
      test("UnknownError を返す", async () => {
        const response = handleServiceError({});
        expect(response.status).toBe(500);
        expect(response.headers.get("Content-Type")).toBe("application/json");
        const body = await response.text();
        expect(body).toEqual(JSON.stringify({ error: "An unknown error occurred" }));
      });
    });
  });


});
