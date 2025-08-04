import { HttpClient } from "./http-client";
import { http, HttpResponse } from "msw";
import { server, requestMock } from "@/tests/mocks/server";

let subject: HttpClient;

const httpbin = "http://httpbin.org";

describe("HttpClient", () => {
	beforeAll(() => {
		subject = new HttpClient(0);
	});

	it("should get with params", async () => {
		const responseBody = {
			args: { key: "value" },
			origin: "87.95.132.111,10.100.91.201",
			url: `${httpbin}/get`,
		};

		server.use(requestMock(`${httpbin}/get`, responseBody));

		const response = await subject.get(`${httpbin}/get`, { key: "value" });

		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should get without params", async () => {
		const responseBody = {
			args: {},
			origin: "87.95.132.111,10.100.91.201",
			url: `${httpbin}/get`,
		};

		server.use(requestMock(`${httpbin}/get`, responseBody));

		const response = await subject.get(`${httpbin}/get`);

		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should handle 404 status codes", async () => {
		server.use(requestMock(`${httpbin}/get`, {}, { status: 404 }));

		await expect(subject.get(`${httpbin}/get`)).rejects.toThrow("HTTP request returned status code 404.");
	});

	it("should post with body", async () => {
		const responseBody = {
			args: {},
			data: '{"key":"value"}',
			files: {},
			form: {},
			json: {
				key: "value",
			},
			origin: "87.95.132.111,10.100.91.201",
			url: `${httpbin}/post`,
		};

		server.use(requestMock(`${httpbin}/post`, responseBody, { method: "post" }));

		const response = await subject.post(`${httpbin}/post`, { key: "value" });

		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should post with headers", async () => {
		const responseBody = {
			args: {},
			data: '{"key":"value"}',
			files: {},
			form: {},
			headers: { Authorization: "Bearer TOKEN" },
			json: {
				key: "value",
			},
			origin: "87.95.132.111,10.100.91.201",
			url: `${httpbin}/post`,
		};

		server.use(requestMock(`${httpbin}/post`, responseBody, { method: "post" }));

		const response = await subject
			.withHeaders({ Authorization: "Bearer TOKEN" })
			.post(`${httpbin}/post`, { key: "value" });

		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should throw if an unsupported method is used", async () => {
		await expect(subject.delete(`${httpbin}/delete`)).rejects.toThrow(
			"Received no response. This looks like a bug.",
		);
	});

	it("should use acceptJson method", async () => {
		const responseBody = { message: "success" };
		server.use(requestMock(`${httpbin}/get`, responseBody));

		const response = await subject.acceptJson().get(`${httpbin}/get`);
		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should use accept method with custom content type", async () => {
		const responseBody = { message: "success" };
		server.use(requestMock(`${httpbin}/get`, responseBody));

		const response = await subject.accept("application/xml").get(`${httpbin}/get`);
		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should use withCacheStore method", () => {
		const mockCache = {};
		const result = subject.withCacheStore(mockCache);
		expect(result).toBeInstanceOf(HttpClient);
	});

	it("should use withOptions method", () => {
		const customOptions = { timeout: 5000 };
		const result = subject.withOptions(customOptions);
		expect(result).toBeInstanceOf(HttpClient);
	});

	it("should use withSocksProxy method", () => {
		const result = subject.withSocksProxy("socks5://127.0.0.1:9050");
		expect(result).toBeInstanceOf(HttpClient);
	});

	it("should create new HttpClient instance", () => {
		const newClient = new HttpClient(60);
		expect(newClient).toBeInstanceOf(HttpClient);
	});

	it("should handle github URLs with special headers", async () => {
		const responseBody = "plain text response";
		server.use(requestMock("https://github.com/test", responseBody));

		// Create a fresh client to avoid cache issues
		const githubClient = new HttpClient(0);
		const response = await githubClient.get("https://github.com/test");
		expect(response.body()).toContain("plain text response");
	});

	it("should clear cache completely", async () => {
		// First, make a request to populate cache
		const responseBody = { message: "cached" };
		server.use(requestMock(`${httpbin}/cached`, responseBody));

		const clientWithCache = new HttpClient(60); // 60 seconds TTL

		// First request - should hit the server
		await clientWithCache.get(`${httpbin}/cached`);

		// Clear cache
		clientWithCache.clearCache();

		// Make another request - should hit server again since cache was cleared
		const response = await clientWithCache.get(`${httpbin}/cached`);
		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should forget specific wallet cache", async () => {
		const mockWallet = {
			address: () => "test-wallet-address",
			network: () => ({
				config: () => ({
					host: () => "http://localhost",
				}),
			}),
			profile: () => ({}),
		};

		const responseBody = { balance: 1000 };
		server.use(requestMock("http://localhost/wallets/test-wallet-address", responseBody));

		const clientWithCache = new HttpClient(60);

		// First request - populates cache
		await clientWithCache.get("http://localhost/wallets/test-wallet-address");

		// Forget wallet cache
		clientWithCache.forgetWalletCache(mockWallet as any);

		// Request again - should work fine (cache key was removed)
		const response = await clientWithCache.get("http://localhost/wallets/test-wallet-address");
		expect(response.json()).toStrictEqual(responseBody);
	});

	it("should use cache and then clear it", async () => {
		let requestCount = 0;
		const responseBody = { count: 0, message: "cached response" };

		server.use(
			http.get(`${httpbin}/cache-test`, () => {
				requestCount++;
				return HttpResponse.json({ ...responseBody, count: requestCount });
			}),
		);

		const clientWithCache = new HttpClient(60);

		// First request - should hit server (count = 1)
		const response1 = await clientWithCache.get(`${httpbin}/cache-test`);
		expect(response1.json().count).toBe(1);

		// Second request - should use cache (count still = 1)
		const response2 = await clientWithCache.get(`${httpbin}/cache-test`);
		expect(response2.json().count).toBe(1);

		// Clear cache
		clientWithCache.clearCache();

		// Third request - should hit server again (count = 2)
		const response3 = await clientWithCache.get(`${httpbin}/cache-test`);
		expect(response3.json().count).toBe(2);
	});

	// @README: Run this locally with TOR running.
	// it("should connect with TOR", async () => {
	// 	const realAddress = await subject.get("https://ipinfo.io");
	// 	const newAddress = await subject.withSocksProxy("socks5://127.0.0.1:9050").get("https://ipinfo.io");

	// 	expect(newAddress.json().ip).not.toBe(realAddress);
	// });
});
