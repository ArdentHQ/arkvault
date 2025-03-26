import { AddressesPanelSettings } from "@/domains/portfolio/hooks/use-address-panel";

export interface DashboardConfiguration {
	hideBalance: boolean;
	walletsDisplayType?: "all" | "starred" | "ledger";
	addressPanelSettings?: AddressesPanelSettings;
	selectedAddressesByNetwork: Record<string, string[]>;
	activeNetworkId?: string;
}
