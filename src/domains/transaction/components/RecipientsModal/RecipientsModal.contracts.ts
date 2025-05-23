export interface RecipientItem {
	address: string;
	alias?: string;
	amount?: number;
	isValidator?: boolean;
}

export interface RecipientsProperties {
	recipients: RecipientItem[];
	ticker: string;
}
