export interface DashboardConfiguration {
	walletsDisplayType?: "all" | "starred" | "ledger";
	selectedAddresses?: string[];
	selectedAddressesByNetwork: Record<string, string[]>;
	activeNetworkId?: string;
}
