export interface DashboardConfiguration {
	walletsDisplayType?: "all" | "starred" | "ledger";
	selectedAddressesByNetwork: Record<string, string[]>;
	activeNetworkId?: string;
}
