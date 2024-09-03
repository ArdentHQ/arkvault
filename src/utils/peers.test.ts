import {
	addressIsValid,
	getBaseUrl,
	isPeer,
	isMusig,
	pingServerAddress,
	getServerHeight,
	isSameNetwork,
	urlBelongsToNetwork,
	hasPath,
	endsWithSlash,
} from "@/utils/peers";
import * as HttpClientMock from "@/app/services/HttpClient";
import { env, getDefaultProfileId, mockProfileWithPublicAndTestNetworks } from "@/utils/testing-library";

const exampleUrl = "http://www.example.com";

describe("addressIsValid", () => {
	it("should return true for a valid domain", () => {
		expect(addressIsValid(exampleUrl)).toBe(true);
	});

	it("should return true for a valid IP address", () => {
		expect(addressIsValid("http://192.168.1.1")).toBe(true);
	});

	it("should return false for an invalid address", () => {
		expect(addressIsValid("http://1")).toBe(false);
	});

	it("should return false for an invalid url", () => {
		expect(addressIsValid("1")).toBe(false);
	});
});

describe("getBaseUrl", () => {
	it("should extract the base URL without path", () => {
		expect(getBaseUrl("http://www.example.com/path")).toEqual(exampleUrl);
	});
});

describe("Server Type Identification", () => {
	it("should identify a peer server correctly", () => {
		expect(isPeer({ data: "Hello World" })).toBe(true);
		expect(isPeer({ data: "Hello" })).toBe(false);
		expect(isPeer({ data: undefined })).toBe(false);
	});

	it("should identify a musig server correctly", () => {
		expect(isMusig({ name: "test-musig-server" })).toBe(true);
		expect(isMusig({ name: "test-server" })).toBe(false);
		expect(isMusig({ name: undefined })).toBe(false);
	});
});

describe("pingServerAddress", () => {
	it("should return true if the server responds correctly", async () => {
		const httpClientMock = vi.spyOn(HttpClientMock, "HttpClient").mockImplementation(() => ({
			get: () => Promise.resolve({ body: () => JSON.stringify({ data: "Hello World" }) }),
		}));

		await expect(pingServerAddress(exampleUrl, "full")).resolves.toBe(true);

		httpClientMock.mockRestore();
	});

	it("should return true if the server responds correctly for musig", async () => {
		const httpClientMock = vi.spyOn(HttpClientMock, "HttpClient").mockImplementation(() => ({
			get: () => Promise.resolve({ body: () => JSON.stringify({ name: "test-musig-server" }) }),
		}));

		await expect(pingServerAddress(exampleUrl, "other")).resolves.toBe(true);

		httpClientMock.mockRestore();
	});

	it("should return false if the server does not respond correctly", async () => {
		const httpClientMock = vi.spyOn(HttpClientMock, "HttpClient").mockImplementation(() => ({
			get: () => Promise.reject(new Error("Failed")),
		}));
		await expect(pingServerAddress(exampleUrl, "full")).resolves.toBe(false);
		httpClientMock.mockRestore();
	});
});

describe("getServerHeight", () => {
	it("should return the height if the server responds with valid data", async () => {
		const httpClientMock = vi.spyOn(HttpClientMock, "HttpClient").mockImplementation(() => ({
			get: () => Promise.resolve({ body: () => JSON.stringify({ data: { block: { height: 1000 } } }) }),
		}));
		await expect(getServerHeight(exampleUrl)).resolves.toBe(1000);
		httpClientMock.mockRestore();
	});

	it("should handle errors and return undefined", async () => {
		const httpClientMock = vi.spyOn(HttpClientMock, "HttpClient").mockImplementation(() => ({
			get: () => Promise.reject(new Error("Failed")),
		}));
		await expect(getServerHeight(exampleUrl)).resolves.toBeUndefined();
		httpClientMock.mockRestore();
	});
});

describe("isSameNetwork", () => {
	it("should return true if networks are the same", () => {
		const networkA = { address: "addr1", network: { id: () => "net1" }, serverType: "full" };
		const networkB = { address: "addr1", network: { id: () => "net1" }, serverType: "full" };
		expect(isSameNetwork(networkA, networkB)).toBe(true);
	});

	it("should return false if networks are different", () => {
		const networkA = { address: "addr1", network: { id: () => "net1" }, serverType: "full" };
		const networkB = { address: "addr1", network: { id: () => "net2" }, serverType: "full" };
		expect(isSameNetwork(networkA, networkB)).toBe(false);
	});
});

describe("urlBelongsToNetwork", () => {
	it.each([true, false])("should determine if url belongs to network", (result) => {
		const profile = env.profiles().findById(getDefaultProfileId());
		const restoreMock = mockProfileWithPublicAndTestNetworks(profile);
		const network = profile.availableNetworks()[0];

		const proberMock = vi.spyOn(profile.coins(), "makeInstance").mockReturnValue({
			// eslint-disable-next-line @typescript-eslint/require-await
			__construct: async () => true,
			prober: () => ({
				evaluate: () => Promise.resolve(result),
			}),
		});

		expect(urlBelongsToNetwork(profile, "http://url", network)).resolves.toBe(result);

		proberMock.mockRestore();
		restoreMock();
	});
});

describe("hasPath", () => {
	it("determine if url has path", () => {
		expect(hasPath("http://www.example.com/test/test2", "/test/test2")).toBe(true);
		expect(hasPath("http://www.example.com/test/test3", "/test/test2")).toBe(false);
	});
});
describe("endsWithSlash", () => {
	it("determine if url ends with slash", () => {
		expect(endsWithSlash("http://www.example.com/")).toBe(true);
		expect(endsWithSlash(exampleUrl)).toBe(false);
	});
});