import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { expect } from "vitest";
import { NetworkRepository } from "./network.repository";

describe("NetworkRepository", () => {
	const networkItem = {
		ark: {
			mainnet: { coin: "ARK", id: "mainnet", name: "Mainnet" },
		},
	};

	test("#all", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		expect(repository.all()).toEqual({});
	});

	test("#allByCoin", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		repository.fill(networkItem);

		const result = repository.allByCoin("ARK");
		expect(result).toHaveLength(1);
	});

	test("#allByCoin - should be case insensitive", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		repository.fill(networkItem);

		const result = repository.allByCoin("ark");
		expect(result).toHaveLength(1);
	});

	test("#allByCoin - should return empty for non-existent coin", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		repository.fill(networkItem);

		const result = repository.allByCoin("nonexistent");
		expect(result).toEqual([]);
	});

	test("#get", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		repository.fill({ mainnet: { coin: "ARK", id: "mainnet", name: "Mainnet" } });

		const result = repository.get("mainnet");
		expect(result.id).toBe("mainnet");
	});

	test("#get - should throw if not found", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		expect(() => repository.get("non-existent")).toThrow("Failed to find hosts that match [non-existent].");
	});

	test("#push", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		const result = repository.push(networkItem.ark.mainnet);

		expect(result.id).toBe("mainnet");
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#fill", ({ profile }) => {
		const repository = new NetworkRepository(profile);

		repository.fill(networkItem.ark);

		expect(repository.get("mainnet")).toBeDefined();
	});

	test("#forget", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.fill(networkItem.ark);
		repository.forget("mainnet");

		expect(() => repository.get("mainnet")).toThrow();
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#forget should throw if network not found", ({ profile }) => {
		const repository = new NetworkRepository(profile);
		expect(() => repository.forget("non-existent")).toThrow("Failed to find hosts that match [non-existent].");
	});
});
