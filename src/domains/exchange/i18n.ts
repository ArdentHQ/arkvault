export const translations = {
	ARK_TRANSACTION_ID: "ARK Transaction ID",
	EMPTY_MESSAGE: "You haven't made any swaps yet. Once you initiate a transaction they will show up here.",

	ERROR: {
		GENERIC: "Your order could not be placed",
		INVALID_ADDRESS: "The provided address is not a valid {{ticker}} address",
		INVALID_REFUND_ADDRESS: "The provided refund address is not a valid {{ticker}} address",
	},

	EXCHANGE_FORM: {
		AMOUNT_RECEIVED: "Amount Received",
		AMOUNT_SENT: "Amount Sent",
		CURRENCY_INPUT: "{{currency}} Input",
		CURRENCY_OUTPUT: "{{currency}} Output",
		ESTIMATED_ARRIVAL: "Estimated Arrival",
		ESTIMATED_RATE: "Estimated Rate",
		ESTIMATED_TIME: "≈ {{estimatedTime}} minutes",
		EXCHANGE_ADDRESS: "Exchange {{currency}} Address",
		FROM_CURRENCY: "From Currency",
		INPUT_TRANSACTION_ID: "Input Transaction ID",
		OUTPUT_TRANSACTION_ID: "Output Transaction ID",
		PAYIN_AMOUNT: "Payin Amount",
		PAYOUT_AMOUNT: "Payout Amount",
		RECIPIENT_PLACEHOLDER: "Enter the payout address",
		RECIPIENT_WALLET: "Recipient Wallet",
		REFUND_PLACEHOLDER: "Enter the refund address",
		REFUND_WALLET: "Refund Wallet",
		SUPPORT_INFO:
			"If you have any question about your exchange, please contact {{exchange}} support team via email at <linkEmail>{{email}}</linkEmail>",
		TERMS: "I've read and agree to the {{exchange}} <linkTerms>{{terms}}</linkTerms> and <linkPrivacyPolicy>{{privacy}}</linkPrivacyPolicy>",
		TO_CURRENCY: "To Currency",
		EXCHANGE_COMPLETED: "Exchange Completed!",
		YOUR_ADDRESS: "Your {{currency}} Address",
		YOU_GET: "You Get",
		YOU_SEND: "You Send",
	},

	EXCHANGE_NAME: "Exchange Name",
	EXPECTED_AMOUNT_HINT: "The final payout amount might be different",

	MANUAL_TRANSFER: "Manual Transfer",
	NEW_EXCHANGE: "New Exchange",

	MODAL_DELETE_EXCHANGE_TRANSACTION: {
		DESCRIPTION:
			"Are you sure you want to remove this swap from the transaction history? This action cannot be undone.",
		TITLE: "Remove Transaction",
	},

	MODAL_SIGN_EXCHANGE_TRANSACTION: {
		SUCCESS_TITLE: "Successfully Signed Transaction",
		TITLE: "Sign Exchange Transaction",
	},

	NAVIGATION: {
		EXCHANGES: "Exchanges",
		TRANSACTIONS: "Transactions",
	},

	PAGE_EXCHANGES: {
		ADD_EXCHANGE: "Add Exchange",
		DELETE_CONFIRMATION: "The exchange transaction <bold>{{orderId}}</bold> has been deleted",
		EMPTY_MESSAGE: "There are currently no exchange providers available, please try again at a later time.",
		SUBTITLE: "Choose one of the exchange providers below to swap directly from within the wallet.",
		TITLE: "Exchange",
	},

	REFUND_WALLET: {
		ADD: "Add Refund Wallet",
		REMOVE: "Remove Refund Wallet",
	},

	SELECT_EXCHANGE_MESSAGE: "Select one of the exchanges you have installed",

	STATUS: {
		CONFIRMING: "Confirming",
		EXCHANGING: "Exchanging",
		EXPIRED: "Expired",
		FAILED: "Failed",
		FINISHED: "Finished",
		NEW: "New",
		REFUNDED: "Refunded",
		SENDING: "Sending",
		VERIFYING: "Verifying",
		WAITING: "Waiting",
	},

	TO_ADDRESS: "To Address",

	TRANSACTION_ID: "Transaction ID",
	TRANSACTION_SENT: "Your transaction was successfully confirmed and sent.",
	TRANSACTION_STATUS: {
		AWAITING_DEPOSIT: "Awaiting Deposit",
		EXCHANGING: "Exchanging",
		EXPIRED: "This transaction has expired.",
		FAILED: "This transaction has failed.",
		REFUNDED: "This transaction has been refunded.",
		SENDING: "Sending to you",
		VERIFYING: "This transaction is being verified by the provider.",
	},

	VALIDATION: {
		INVALID_ADDRESS: "Not a valid {{ticker}} address",
		MIN_AMOUNT: "The minimal exchange amount is {{amount}} {{ticker}}",
		PAIR_NOT_AVAILABLE: "The pair <bold>{{from}}</bold> / <bold>{{to}}</bold> is not available.",
	},

	YOUR_EXCHANGE_LIST: "Your Exchange List",
};
