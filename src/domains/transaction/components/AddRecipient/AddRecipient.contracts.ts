import { Contracts } from "@payvo/sdk-profiles";

import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";

export interface AddRecipientProperties {
	disableMultiPaymentOption?: boolean;
	onChange: (recipients: RecipientItem[]) => void;
	profile: Contracts.IProfile;
	recipients: RecipientItem[];
	showMultiPaymentOption?: boolean;
	wallet?: Contracts.IReadWriteWallet;
	withDeeplink?: boolean;
}

export interface ToggleButtonProperties {
	maxRecipients: number;
	isSingle: boolean;
	disableMultiple?: boolean;
	onChange: (isSingle: boolean) => void;
}
