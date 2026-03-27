import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { expect } from "vitest";
import { HostRepository } from "./host.repository";

describe("HostRepository", () => {
	const host = { ip: "127.0.0.1", port: 4000 };
	const host2 = { ip: "127.0.0.2", port: 4000 };

	test("#all", ({ profile }) => {
		const repository = new HostRepository(profile);
		expect(repository.all()).toEqual({});
	});

	test("#allByNetwork", ({ profile }) => {
		const repository = new HostRepository(profile);
		expect(repository.allByNetwork("mainsail.devnet")).toEqual([]);
	});

	test("#push", ({ profile }) => {
		const repository = new HostRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		const result = repository.push({ host, name: "test-host", network: "mainsail.devnet" });

		expect(result).toHaveLength(1);
		expect(result[0].host.custom).toBe(true);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#push should initialize array if not exists", ({ profile }) => {
		const repository = new HostRepository(profile);

		repository.push({ host, name: "test-host", network: "mainsail.devnet" });

		expect(repository.allByNetwork("mainsail.devnet")).toHaveLength(1);
	});

	test("#fill", ({ profile }) => {
		const repository = new HostRepository(profile);

		repository.fill({
			"mainsail.devnet": [{ host: { ip: "127.0.0.1", port: 4000 }, name: "test" }],
		});

		expect(repository.allByNetwork("mainsail.devnet")).toHaveLength(1);
	});

	test("#forget with network only", ({ profile }) => {
		const repository = new HostRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.push({ host, name: "test-host", network: "mainsail.devnet" });

		repository.forget("mainsail.devnet");

		expect(repository.allByNetwork("mainsail.devnet")).toEqual([]);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#forget with index", ({ profile }) => {
		const repository = new HostRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.push({ host, name: "host1", network: "mainsail.devnet" });
		repository.push({ host: host2, name: "host2", network: "mainsail.devnet" });

		repository.forget("mainsail.devnet", 0);

		expect(repository.allByNetwork("mainsail.devnet")).toHaveLength(1);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});
});
