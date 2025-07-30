import { describe, it, expect } from "vitest";
import { Exception, RequestException, BadResponseException } from "./http-exceptions";
import { HttpResponse } from "./http-response";

describe("http-exceptions", () => {
	describe("Exception", () => {
		it("should create exception with message", () => {
			const message = "Test error message";
			const exception = new Exception(message);

			expect(exception).toBeInstanceOf(Error);
			expect(exception).toBeInstanceOf(Exception);
			expect(exception.message).toBe(message);
			expect(exception.name).toBe("Exception");
		});

		it("should have non-enumerable message property", () => {
			const exception = new Exception("test");
			const descriptor = Object.getOwnPropertyDescriptor(exception, "message");

			expect(descriptor?.enumerable).toBe(false);
			expect(descriptor?.value).toBe("test");
		});

		it("should have non-enumerable name property", () => {
			const exception = new Exception("test");
			const descriptor = Object.getOwnPropertyDescriptor(exception, "name");

			expect(descriptor?.enumerable).toBe(false);
			expect(descriptor?.value).toBe("Exception");
		});

		it("should capture stack trace", () => {
			const exception = new Exception("test");
			expect(exception.stack).toBeDefined();
			expect(typeof exception.stack).toBe("string");
		});
	});

	describe("RequestException", () => {
		let mockResponse: HttpResponse;

		beforeEach(() => {
			// Use status code 200 to avoid automatic exception throwing
			mockResponse = new HttpResponse({
				body: "Success response",
				headers: {},
				statusCode: 200,
			});

			// Mock the status method to return error codes for testing
			mockResponse.status = () => 404;
		});

		it("should create request exception with response only", () => {
			const exception = new RequestException(mockResponse);

			expect(exception).toBeInstanceOf(Error);
			expect(exception).toBeInstanceOf(RequestException);
			expect(exception.message).toBe("HTTP request returned status code 404.");
			expect(exception.name).toBe("RequestException");
		});

		it("should create request exception with response and error", () => {
			const innerError = new Error("Inner error");
			const exception = new RequestException(mockResponse, innerError);

			expect(exception.message).toBe("HTTP request returned status code 404: Inner error");
		});

		it("should have non-enumerable message property", () => {
			const exception = new RequestException(mockResponse);
			const descriptor = Object.getOwnPropertyDescriptor(exception, "message");

			expect(descriptor?.enumerable).toBe(false);
		});

		it("should have non-enumerable name property", () => {
			const exception = new RequestException(mockResponse);
			const descriptor = Object.getOwnPropertyDescriptor(exception, "name");

			expect(descriptor?.enumerable).toBe(false);
			expect(descriptor?.value).toBe("RequestException");
		});

		it("should have non-enumerable response property", () => {
			const exception = new RequestException(mockResponse);
			const descriptor = Object.getOwnPropertyDescriptor(exception, "response");

			expect(descriptor?.enumerable).toBe(false);
			expect(descriptor?.value).toBe(mockResponse);
		});

		it("should capture stack trace", () => {
			const exception = new RequestException(mockResponse);
			expect(exception.stack).toBeDefined();
			expect(typeof exception.stack).toBe("string");
		});

		it("should handle different status codes", () => {
			const response500 = new HttpResponse({
				body: "Success response",
				headers: {},
				statusCode: 200,
			});
			response500.status = () => 500;

			const exception = new RequestException(response500);
			expect(exception.message).toBe("HTTP request returned status code 500.");
		});

		it("should handle error with complex message", () => {
			const complexError = { message: "Complex error with details" };
			const exception = new RequestException(mockResponse, complexError as Error);

			expect(exception.message).toBe("HTTP request returned status code 404: Complex error with details");
		});
	});

	describe("BadResponseException", () => {
		it("should create bad response exception with code", () => {
			const code = "INVALID_JSON";
			const exception = new BadResponseException(code);

			expect(exception).toBeInstanceOf(Error);
			expect(exception).toBeInstanceOf(Exception);
			expect(exception).toBeInstanceOf(BadResponseException);
			expect(exception.message).toBe("Bad Response: INVALID_JSON");
			expect(exception.name).toBe("BadResponseException");
		});

		it("should handle different error codes", () => {
			const exception1 = new BadResponseException("TIMEOUT");
			expect(exception1.message).toBe("Bad Response: TIMEOUT");

			const exception2 = new BadResponseException("NETWORK_ERROR");
			expect(exception2.message).toBe("Bad Response: NETWORK_ERROR");
		});

		it("should have non-enumerable properties", () => {
			const exception = new BadResponseException("TEST");

			const messageDescriptor = Object.getOwnPropertyDescriptor(exception, "message");
			expect(messageDescriptor?.enumerable).toBe(false);

			const nameDescriptor = Object.getOwnPropertyDescriptor(exception, "name");
			expect(nameDescriptor?.enumerable).toBe(false);
		});

		it("should capture stack trace", () => {
			const exception = new BadResponseException("TEST");
			expect(exception.stack).toBeDefined();
			expect(typeof exception.stack).toBe("string");
		});

		it("should handle empty code", () => {
			const exception = new BadResponseException("");
			expect(exception.message).toBe("Bad Response: ");
		});
	});
});
