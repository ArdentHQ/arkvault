import { describe, it, expect } from "vitest";
import { profileMigrations } from "./profile-migrations";

describe("profileMigrations", () => {
	it("should set ark pricing as the market provider", () => {
		const data = { settings: { EXCHANGE_CURRENCY: "USD", MARKET_PROVIDER: "cryptocompare" } };

		profileMigrations["1.18.0"]({ data, profile: {} } as any);

		expect(data.settings.MARKET_PROVIDER).toBe("arkpricing");
	});

	it("should fall back to coingecko when ark pricing does not support the exchange currency", () => {
		const data = { settings: { EXCHANGE_CURRENCY: "MXN", MARKET_PROVIDER: "cryptocompare" } };

		profileMigrations["1.18.0"]({ data, profile: {} } as any);

		expect(data.settings.MARKET_PROVIDER).toBe("coingecko");
	});
});
