import { Array_ } from "@/app/lib/helpers";

import { ConfigRepository } from "./coins";
import { NetworkHost, NetworkHostType } from "./networks";
import { HostSet, HostMap } from "@/app/lib/profiles/host.repository.contract";

export const filterHosts = (hosts: NetworkHost[], type: NetworkHostType): NetworkHost[] =>
	hosts.filter((host: NetworkHost) => host.type === type);

export const randomHost = (hosts: NetworkHost[], type: NetworkHostType): NetworkHost =>
	Array_.randomElement(filterHosts(hosts, type));

export const groupCustomHosts = (hosts: HostSet): HostMap => {
	const customHosts: HostMap = {};

	for (const { host, name } of hosts) {
		if (customHosts[name] === undefined) {
			customHosts[name] = [];
		}
		customHosts[name].push({ host, name });
	}

	return customHosts;
};

// DRY helpers for coin implementations
export const filterHostsFromConfig = (config: ConfigRepository, type: NetworkHostType): NetworkHost[] =>
	filterHosts(config.get<NetworkHost[]>("network.hosts"), type);

export const randomNetworkHostFromConfig = (config: ConfigRepository, type: NetworkHostType = "full"): NetworkHost =>
	randomHost(config.get<NetworkHost[]>("network.hosts"), type);

export const pluckAddress = (query): string => {
	if (query.senderId) {
		return query.senderId;
	}

	if (query.recipientId) {
		return query.recipientId;
	}

	if (Array.isArray(query.identifiers) && query.identifiers[0]) {
		return query.identifiers[0].value;
	}

	throw new Error("Failed to pluck any address.");
};
