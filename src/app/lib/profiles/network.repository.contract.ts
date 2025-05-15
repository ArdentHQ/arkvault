import { Networks } from "@/app/lib/mainsail";

export type Network = Networks.NetworkManifest;
export type NetworkMap = Record<string, Network>;

export interface INetworkRepository {
	all(): NetworkMap;

	allByCoin(coin: string): Network[];

	get(network: string): Network;

	push(host: Network): Network;

	fill(entries: object): void;

	forget(network: string): void;
}
