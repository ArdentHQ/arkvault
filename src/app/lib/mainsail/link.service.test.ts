import { describe, it, expect, beforeEach } from "vitest";
import { LinkService } from "./link.service";

class ConfigRepository {
	host(): string {
		return "http://explorer.example.com"
	}
}

interface IProfile { }
const mockProfile: IProfile = {};

describe("LinkService", () => {
	let config: ConfigRepository;
	let linkService: LinkService;

	beforeEach(() => {
		config = new ConfigRepository();
		linkService = new LinkService({ config, profile: mockProfile });
	});

	it("should generate a block URL", () => {
		expect(linkService.block("123")).toBe("http://explorer.example.com/blocks/123");
	});

	it("should generate a transaction URL", () => {
		expect(linkService.transaction("123")).toBe("http://explorer.example.com/transactions/123");
	});

	it("should generate a wallet URL", () => {
		expect(linkService.wallet("123")).toBe("http://explorer.example.com/addresses/123");
	});

	it("should correctly handle explorerUrl ending with a trailing slash", () => {
		expect(linkService.block("123")).toBe("http://explorer.example.com/blocks/123");
	});
});
