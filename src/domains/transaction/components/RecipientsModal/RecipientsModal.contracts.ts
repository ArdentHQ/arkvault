export interface RecipientItem {
	address: string;
	alias?: string;
	amount?: number;
	isDelegate?: boolean;
}

export interface RecipientsProperties {
	recipients: RecipientItem[];
	ticker: string;
}
