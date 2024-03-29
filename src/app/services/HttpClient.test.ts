import { HttpClient } from "./HttpClient";

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

	// @README: Run this locally with TOR running.
	// it("should connect with TOR", async () => {
	// 	const realAddress = await subject.get("https://ipinfo.io");
	// 	const newAddress = await subject.withSocksProxy("socks5://127.0.0.1:9050").get("https://ipinfo.io");

	// 	expect(newAddress.json().ip).not.toBe(realAddress);
	// });
});
