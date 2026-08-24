import { describe, it, expect } from "vitest";
import { profileMigrations } from "./profile-migrations";

describe("profileMigrations", () => {
	it("should set ark pricing as the market provider", () => {
		const data = { settings: { MARKET_PROVIDER: "cryptocompare" } };

		profileMigrations["1.18.0"]({ data, profile: {} } as any);

		expect(data.settings.MARKET_PROVIDER).toBe("arkpricing");
	});
});
