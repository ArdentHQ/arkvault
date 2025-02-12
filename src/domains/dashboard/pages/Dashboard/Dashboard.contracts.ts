export interface DashboardConfiguration {
	hideBalance: boolean;
	walletsDisplayType?: "all" | "starred" | "ledger";
	selectedAddressesByNetwork: Record<string, string[]>;
	activeNetworkId?: string;
}
