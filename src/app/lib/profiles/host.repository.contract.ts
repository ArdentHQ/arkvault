import { Networks } from "@ardenthq/sdk";

export type Host = Networks.NetworkHost;
export type HostSet = { name: string; host: Host }[];
export type HostMap = Record<string, HostSet>;

export interface IHostRepository {
	all(): HostMap;

	allByNetwork(network: string): HostSet;

	push(data: { host: Host; name: string; network: string }): HostSet;

	fill(entries: object): void;

	forget(network: string, index?: number): void;
}
