import { describe, it, expect, vi, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import * as peers from "./peers";

const exampleUrl = "http://example.com";
const exampleUrl2 = "http://example.com/";

describe("peers utils", () => {
	afterEach(() => {
		vi.clearAllMocks();
		server.resetHandlers();
	});

	it("addressIsValid returns true for valid domain and ip", () => {
		expect(peers.addressIsValid(exampleUrl)).toBe(true);
		expect(peers.addressIsValid("http://127.0.0.1")).toBe(true);
	});

	it("addressIsValid returns false for invalid address", () => {
		expect(peers.addressIsValid("not-a-url")).toBe(false);
	});

	it("hostRegex matches valid host", () => {
		const match = peers.hostRegex.exec("http://example.com:8080");
		expect(match?.groups?.host).toBe("example.com");
	});

	it("ipRegex matches valid ip", () => {
		const match = peers.ipRegex.exec("http://127.0.0.1:8080");
		expect(match?.groups?.host).toBe("127.0.0.1");
	});

	it("isValidIp returns true for valid ip", () => {
		expect(peers.isValidIp("http://127.0.0.1:8080")).toBe(true);
	});

	it("isValidDomain returns true for valid domain", () => {
		expect(peers.isValidDomain("http://example.com:8080")).toBe(true);
	});

	it("isSameNetwork returns true for same network", () => {
		const network = { network: { id: () => "id" }, publicApiEndpoint: "endpoint" };
		expect(peers.isSameNetwork(network, network)).toBe(true);
	});

	it("isSameNetwork returns false for different network", () => {
		const a = { network: { id: () => "a" }, publicApiEndpoint: "endpoint" };
		const b = { network: { id: () => "b" }, publicApiEndpoint: "endpoint" };
		expect(peers.isSameNetwork(a, b)).toBe(false);
	});

	it("hasPath returns true for matching path", () => {
		expect(peers.hasPath("http://example.com/foo", "/foo")).toBe(true);
	});

	it("endsWithSlash returns true if url ends with slash", () => {
		expect(peers.endsWithSlash(exampleUrl2)).toBe(true);
	});

	it("getBaseUrl returns protocol, host, and port", () => {
		expect(peers.getBaseUrl("http://example.com:8080/foo")).toBe("http://example.com:8080");
	});

	it("isPeer returns true if body.data contains 'hello world'", () => {
		expect(peers.isPeer({ data: "hello world!" })).toBe(true);
	});

	it("isPeer returns false if body.data is missing or does not contain 'hello world'", () => {
		expect(peers.isPeer({})).toBe(false);
		expect(peers.isPeer(undefined)).toBe(false);
		expect(peers.isPeer({ data: "something else" })).toBe(false);
	});

	it("isMusig returns true if name ends with -musig-server", () => {
		expect(peers.isMusig({ name: "foo-musig-server" })).toBe(true);
	});

	it("isMusig returns false if name is not a string or does not end with -musig-server", () => {
		expect(peers.isMusig({ name: 123 })).toBe(false);
		expect(peers.isMusig({ name: "foo" })).toBe(false);
	});

	it("pingServerAddress returns true for full type and isPeer true", async () => {
		const handler = http.get(exampleUrl2, () => HttpResponse.json({ data: "hello world!" }));
		server.use(handler);

		const result = await peers.pingServerAddress(exampleUrl, "full");
		expect(result).toBe(true);
	});

	it("pingServerAddress returns false on error", async () => {
		const handler = http.get(exampleUrl2, () => HttpResponse.error());
		server.use(handler);

		const result = await peers.pingServerAddress(exampleUrl, "full");
		expect(result).toBe(false);
	});

	it("getServerHeight returns number on success", async () => {
		const handler = http.get("http://example.com/api/blockchain", () =>
			HttpResponse.json({ data: { block: { number: 100 } } }),
		);
		server.use(handler);

		const result = await peers.getServerHeight(exampleUrl);
		expect(result).toBe(100);
	});

	it("getServerHeight returns undefined on error", async () => {
		const handler = http.get("http://example.com/api/blockchain", () => HttpResponse.error());
		server.use(handler);

		const result = await peers.getServerHeight(exampleUrl);
		expect(result).toBeUndefined();
	});

	it("isValidUrl returns true for valid url", () => {
		expect(peers.isValidUrl(exampleUrl)).toBe(true);
	});

	it("isValidUrl returns false for invalid url", () => {
		expect(peers.isValidUrl("not-a-url")).toBe(false);
	});

	it("pingServerAddress returns true for musig type and isMusig true", async () => {
		const handler = http.get(exampleUrl2, () => HttpResponse.json({ name: "test-musig-server" }));
		server.use(handler);

		const result = await peers.pingServerAddress(exampleUrl, "musig");
		expect(result).toBe(true);
	});

	it("pingServerAddress returns false for musig type and isMusig false", async () => {
		const handler = http.get(exampleUrl2, () => HttpResponse.json({ name: "test-regular-server" }));
		server.use(handler);

		const result = await peers.pingServerAddress(exampleUrl, "musig");
		expect(result).toBe(false);
	});
});
