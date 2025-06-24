import { describe, it, expect } from "vitest";
import { filterHosts, randomHost, groupCustomHosts, filterHostsFromConfig, randomNetworkHostFromConfig } from "./hosts";
import { ConfigRepository } from "@/app/lib/mainsail/config.repository";
import { HostSet } from "@/app/lib/profiles/host.repository.contract";
import { NetworkHost } from "@/app/lib/mainsail/networks";

const hosts: NetworkHost[] = [
	{ host: "https://full.ark.io", type: "full" },
	{ host: "https://musig.ark.io", type: "musig" },
	{ host: "https://explorer.ark.io", type: "explorer" },
];

describe("filterHosts", () => {
	it("should filter hosts by type", () => {
		const filtered = filterHosts(hosts, "full");
		expect(filtered).toHaveLength(1);
		expect(filtered[0].type).toBe("full");
	});
});

describe("randomHost", () => {
	it("should return a random host of a given type", () => {
		const random = randomHost(hosts, "full");
		expect(random.type).toBe("full");
	});
});

describe("groupCustomHosts", () => {
	it("should group custom hosts by name", () => {
		const customHosts: HostSet = [
			{ host: { host: "https://custom1.ark.io", type: "full" }, name: "ark" },
			{ host: { host: "https://custom2.ark.io", type: "full" }, name: "ark" },
			{ host: { host: "https://custom.solar.io", type: "full" }, name: "solar" },
		];
		const grouped = groupCustomHosts(customHosts);
		expect(Object.keys(grouped)).toHaveLength(2);
		expect(grouped.ark).toHaveLength(2);
		expect(grouped.solar).toHaveLength(1);
	});
});

const config = new ConfigRepository({
	network: {
		hosts: hosts,
	},
});

describe("filterHostsFromConfig", () => {
	it("should filter hosts from config by type", () => {
		const filtered = filterHostsFromConfig(config, "musig");
		expect(filtered).toHaveLength(1);
		expect(filtered[0].type).toBe("musig");
	});
});

describe("randomNetworkHostFromConfig", () => {
	it("should get a random host from config", () => {
		const random = randomNetworkHostFromConfig(config, "explorer");
		expect(random.type).toBe("explorer");
	});

	it("should default to full type if not specified", () => {
		const random = randomNetworkHostFromConfig(config);
		expect(random.type).toBe("full");
	});
});
