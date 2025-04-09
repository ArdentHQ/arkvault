import { NetworkConfig } from "@/app/lib/mainsail/crypto/interfaces/networks";
import * as networks from "@/app/lib/mainsail/crypto/networks/index";
import { NetworkName } from "@/app/lib/mainsail/crypto/types";

export class NetworkManager {
	public static all(): Record<NetworkName, NetworkConfig> {
		// @ts-ignore - the newly generated unitnet doesn't match the old configs because it has things like a nonce field
		return networks as unknown as Record<NetworkName, NetworkConfig>;
	}

	public static findByName(name: NetworkName): NetworkConfig {
		return networks[name.toLowerCase()] as any;
	}
}
