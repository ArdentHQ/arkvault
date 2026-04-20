export interface RecipientItem {
	address: string;
	alias?: string;
	amount?: string;
	isValidator?: boolean;
}

export interface RecipientsProperties {
	recipients: RecipientItem[];
	ticker: string;
}
