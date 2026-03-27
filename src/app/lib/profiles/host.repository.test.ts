import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { expect } from "vitest";
import { HostRepository } from "./host.repository";

describe("HostRepository", () => {
	const host = { ip: "127.0.0.1", port: 4000 };
	const host2 = { ip: "127.0.0.2", port: 4000 };
	const networkName = "mainsail.devnet";

	test("#all", ({ profile }) => {
		const repository = new HostRepository(profile);
		expect(repository.all()).toEqual({});
	});

	test("#allByNetwork", ({ profile }) => {
		const repository = new HostRepository(profile);
		expect(repository.allByNetwork(networkName)).toEqual([]);
	});

	test("#push", ({ profile }) => {
		const repository = new HostRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		const result = repository.push({ host, name: "test-host", network: networkName });

		expect(result).toHaveLength(1);
		expect(result[0].host.custom).toBe(true);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#push should initialize array if not exists", ({ profile }) => {
		const repository = new HostRepository(profile);

		repository.push({ host, name: "test-host", network: networkName });

		expect(repository.allByNetwork(networkName)).toHaveLength(1);
	});

	test("#fill", ({ profile }) => {
		const repository = new HostRepository(profile);

		repository.fill({
			[networkName]: [{ host: { ip: "127.0.0.1", port: 4000 }, name: "test" }],
		});

		expect(repository.allByNetwork(networkName)).toHaveLength(1);
	});

	test("#forget with network only", ({ profile }) => {
		const repository = new HostRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.push({ host, name: "test-host", network: networkName });

		repository.forget(networkName);

		expect(repository.allByNetwork(networkName)).toEqual([]);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#forget with index", ({ profile }) => {
		const repository = new HostRepository(profile);
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		repository.push({ host, name: "host1", network: networkName });
		repository.push({ host: host2, name: "host2", network: networkName });

		repository.forget(networkName, 0);

		expect(repository.allByNetwork(networkName)).toHaveLength(1);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});
});
