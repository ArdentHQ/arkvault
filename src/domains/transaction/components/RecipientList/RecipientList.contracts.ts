import { IProfile } from "@/app/lib/profiles/contracts";
import { TransactionDetailProperties } from "@/domains/transaction/components/TransactionDetail/TransactionDetail";

type RecipientListLabel = "TRANSACTION.MULTISIGNATURE.PARTICIPANT_#";

export interface RecipientItem {
	address: string;
	alias?: string;
	amount?: number;
	isContract?: boolean;
}

export interface RecipientListItemProperties {
	disableButton?: (address: string) => boolean;
	exchangeTicker: string;
	isEditable?: boolean;
	label?: RecipientListLabel;
	listIndex: number;
	onRemove?: (index: number) => void;
	recipient: RecipientItem;
	showAmount?: boolean;
	showExchangeAmount?: boolean;
	ticker: string;
	tooltipDisabled?: string;
	variant?: "condensed";
	profile: IProfile;
}

export interface RecipientListProperties {
	disableButton?: (address: string) => boolean;
	isEditable: boolean;
	label?: RecipientListLabel;
	onRemove?: (index: number) => void;
	recipients: RecipientItem[];
	showAmount: boolean;
	showExchangeAmount: boolean;
	ticker: string;
	tooltipDisabled?: string;
	variant?: "condensed";
}

export type TransactionRecipientsProperties = {
	currency: string;
	recipients: RecipientItem[];
	showAmount?: boolean;
} & TransactionDetailProperties;
