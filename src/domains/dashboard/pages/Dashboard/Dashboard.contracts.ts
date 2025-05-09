import { AddressesPanelSettings, AddressViewType } from "@/domains/portfolio/hooks/use-address-panel";

export interface DashboardConfiguration {
	hideBalance: boolean;
	walletsDisplayType?: "all" | "starred" | "ledger";
	addressPanelSettings?: AddressesPanelSettings;
	selectedMode: AddressViewType;
	selectedAddressesByNetwork: Record<string, string[]>;
	selectedAddresses: string[];
	activeNetworkId?: string;
}
