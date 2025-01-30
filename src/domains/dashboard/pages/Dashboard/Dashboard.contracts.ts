export interface DashboardConfiguration {
	walletsDisplayType: "all" | "starred" | "ledger";
	selectedNetworkIds: string[];
	selectedAddresses?: string[];
}
