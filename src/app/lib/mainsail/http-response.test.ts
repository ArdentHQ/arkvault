import { describe, it, expect } from "vitest";
import { HttpResponse } from "./http-response";
import { RequestException } from "./http-exceptions";

describe("HttpResponse", () => {
	describe("constructor", () => {
		it("should create response with successful status code", () => {
			const response = new HttpResponse({
				body: "success",
				headers: { "content-type": "application/json" },
				statusCode: 200,
			});

			expect(response.status()).toBe(200);
			expect(response.body()).toBe("success");
		});

		it("should throw RequestException for client error status codes", () => {
			expect(() => {
				new HttpResponse({
					body: "not found",
					headers: {},
					statusCode: 404,
				});
			}).toThrow(RequestException);
		});

		it("should throw RequestException for server error status codes", () => {
			expect(() => {
				new HttpResponse({
					body: "server error",
					headers: {},
					statusCode: 500,
				});
			}).toThrow(RequestException);
		});

		it("should create response with error parameter", () => {
			const error = new Error("Custom error");
			const response = new HttpResponse(
				{
					body: "success",
					headers: {},
					statusCode: 200,
				},
				error,
			);

			expect(response.status()).toBe(200);
		});
	});

	describe("body", () => {
		it("should return body content", () => {
			const response = new HttpResponse({
				body: "test content",
				headers: {},
				statusCode: 200,
			});

			expect(response.body()).toBe("test content");
		});

		it("should throw error for empty body", () => {
			const response = new HttpResponse({
				body: "",
				headers: {},
				statusCode: 200,
			});

			expect(() => response.body()).toThrow("The response body is empty.");
		});

		it("should throw error for undefined body", () => {
			const response = new HttpResponse({
				body: undefined,
				headers: {},
				statusCode: 200,
			});

			expect(() => response.body()).toThrow("The response body is empty.");
		});
	});

	describe("json", () => {
		it("should parse JSON body", () => {
			const jsonData = { name: "test", value: 123 };
			const response = new HttpResponse({
				body: JSON.stringify(jsonData),
				headers: {},
				statusCode: 200,
			});

			expect(response.json()).toEqual(jsonData);
		});

		it("should parse JSON array", () => {
			const jsonArray = [1, 2, 3];
			const response = new HttpResponse({
				body: JSON.stringify(jsonArray),
				headers: {},
				statusCode: 200,
			});

			expect(response.json()).toEqual(jsonArray);
		});

		it("should throw error for invalid JSON", () => {
			const response = new HttpResponse({
				body: "invalid json {",
				headers: {},
				statusCode: 200,
			});

			expect(() => response.json()).toThrow();
		});
	});

	describe("header and headers", () => {
		it("should return specific header", () => {
			const response = new HttpResponse({
				body: "test",
				headers: {
					"content-type": "application/json",
					"x-custom": "value",
				},
				statusCode: 200,
			});

			expect(response.header("content-type")).toBe("application/json");
			expect(response.header("x-custom")).toBe("value");
		});

		it("should return undefined for non-existent header", () => {
			const response = new HttpResponse({
				body: "test",
				headers: {},
				statusCode: 200,
			});

			expect(response.header("non-existent")).toBeUndefined();
		});

		it("should return all headers", () => {
			const headers = {
				"content-type": "application/json",
				"x-custom": "value",
			};

			const response = new HttpResponse({
				body: "test",
				headers,
				statusCode: 200,
			});

			expect(response.headers()).toEqual(headers);
		});
	});

	describe("status checks", () => {
		it("should identify successful responses (200-299)", () => {
			const response200 = new HttpResponse({
				body: "ok",
				headers: {},
				statusCode: 200,
			});

			const response201 = new HttpResponse({
				body: "created",
				headers: {},
				statusCode: 201,
			});

			const response299 = new HttpResponse({
				body: "success",
				headers: {},
				statusCode: 299,
			});

			expect(response200.successful()).toBe(true);
			expect(response201.successful()).toBe(true);
			expect(response299.successful()).toBe(true);
		});

		it("should identify OK responses (200)", () => {
			const response200 = new HttpResponse({
				body: "ok",
				headers: {},
				statusCode: 200,
			});

			const response201 = new HttpResponse({
				body: "created",
				headers: {},
				statusCode: 201,
			});

			expect(response200.ok()).toBe(true);
			expect(response201.ok()).toBe(false);
		});

		it("should identify redirect responses (300-399)", () => {
			const response301 = new HttpResponse({
				body: "moved",
				headers: {},
				statusCode: 301,
			});

			const response200 = new HttpResponse({
				body: "ok",
				headers: {},
				statusCode: 200,
			});

			expect(response301.redirect()).toBe(true);
			expect(response200.redirect()).toBe(false);
		});
	});

	describe("error status checks", () => {
		it("should identify client errors (400-499)", () => {
			// These will throw, so we need to catch them
			expect(() => {
				new HttpResponse({
					body: "bad request",
					headers: {},
					statusCode: 400,
				});
			}).toThrow(RequestException);

			expect(() => {
				new HttpResponse({
					body: "not found",
					headers: {},
					statusCode: 404,
				});
			}).toThrow(RequestException);

			expect(() => {
				new HttpResponse({
					body: "conflict",
					headers: {},
					statusCode: 409,
				});
			}).toThrow(RequestException);
		});

		it("should identify server errors (500+)", () => {
			// These will throw, so we need to catch them
			expect(() => {
				new HttpResponse({
					body: "server error",
					headers: {},
					statusCode: 500,
				});
			}).toThrow(RequestException);

			expect(() => {
				new HttpResponse({
					body: "bad gateway",
					headers: {},
					statusCode: 502,
				});
			}).toThrow(RequestException);
		});

		it("should not throw for non-error status codes", () => {
			expect(() => {
				new HttpResponse({
					body: "ok",
					headers: {},
					statusCode: 200,
				});
			}).not.toThrow();

			expect(() => {
				new HttpResponse({
					body: "moved",
					headers: {},
					statusCode: 301,
				});
			}).not.toThrow();

			expect(() => {
				new HttpResponse({
					body: "found",
					headers: {},
					statusCode: 302,
				});
			}).not.toThrow();
		});

		it("should identify failed responses correctly", () => {
			const successResponse = new HttpResponse({
				body: "ok",
				headers: {},
				statusCode: 200,
			});

			const redirectResponse = new HttpResponse({
				body: "moved",
				headers: {},
				statusCode: 301,
			});

			expect(successResponse.failed()).toBe(false);
			expect(redirectResponse.failed()).toBe(false);
		});
	});

	describe("edge cases", () => {
		it("should handle empty headers", () => {
			const response = new HttpResponse({
				body: "test",
				headers: {},
				statusCode: 200,
			});

			expect(response.headers()).toEqual({});
			expect(response.header("any")).toBeUndefined();
		});

		it("should handle status code boundaries", () => {
			const response199 = new HttpResponse({
				body: "info",
				headers: {},
				statusCode: 199,
			});

			const response300 = new HttpResponse({
				body: "redirect",
				headers: {},
				statusCode: 300,
			});

			const response399 = new HttpResponse({
				body: "redirect",
				headers: {},
				statusCode: 399,
			});

			expect(response199.successful()).toBe(false);
			expect(response199.redirect()).toBe(false);

			expect(response300.successful()).toBe(false);
			expect(response300.redirect()).toBe(true);

			expect(response399.redirect()).toBe(true);
		});

		it("should handle complex JSON structures", () => {
			const complexData = {
				meta: {
					page: 1,
					total: 2,
				},
				users: [
					{ active: true, id: 1, name: "John" },
					{ active: false, id: 2, name: "Jane" },
				],
			};

			const response = new HttpResponse({
				body: JSON.stringify(complexData),
				headers: {},
				statusCode: 200,
			});

			expect(response.json()).toEqual(complexData);
		});
	});
});
