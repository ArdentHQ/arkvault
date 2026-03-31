import { describe, it, expect, vi, beforeEach } from "vitest";
import { AppearanceService } from "./appearance.service";

describe("AppearanceService", () => {
	let service: AppearanceService;
	let mockProfile: any;

	beforeEach(() => {
		mockProfile = {
			settings: () => ({
				missing: vi.fn().mockReturnValue(true),
				get: vi.fn(),
			}),
			getAttributes: () => ({
				get: vi.fn().mockReturnValue(undefined),
			}),
		};
		service = new AppearanceService(mockProfile);
	});

	it("should return all appearance settings", () => {
		const all = service.all();
		expect(all).toHaveProperty("theme");
		expect(all).toHaveProperty("useNetworkWalletNames");
	});

	it("should return defaults", () => {
		const defaults = service.defaults();
		expect(defaults.theme).toBe("light");
		expect(defaults.useNetworkWalletNames).toBe(false);
	});

	it("should get theme setting", () => {
		expect(service.get("theme")).toBe("light");
	});

	it("should throw for invalid key", () => {
		expect(() => service.get("invalid" as any)).toThrow('Parameter "key" must be one of:');
	});

	it("should get setting from profile settings when available", () => {
		mockProfile.settings = () => ({
			missing: vi.fn().mockReturnValue(false),
			get: vi.fn().mockReturnValue("dark"),
		});
		service = new AppearanceService(mockProfile);
		expect(service.get("theme")).toBe("dark");
	});

	it("should get setting from attributes when settings missing", () => {
		mockProfile.getAttributes = () => ({
			get: vi.fn().mockReturnValue("dark"),
		});
		service = new AppearanceService(mockProfile);
		expect(service.get("theme")).toBe("dark");
	});
});
