export const translations = {
	ACCOUNT: "Account",
	ACCOUNT_NICKNAME: "Account Nickname",
	ADDRESS: "Address",
	ADDRESSING: "Addressing",
	ADD_LINK: "Add Link",
	ADD_RECIPIENT: "Add Recipient",
	ALL: "All",
	ALL_HISTORY: "All History",
	AMOUNT: "Amount",
	AUTHENTICATION_STEP: {
		DESCRIPTION_ENCRYPTION_PASSWORD: "Enter your encryption password to authenticate the transaction.",
		DESCRIPTION_MNEMONIC: "Enter your mnemonic passphrase to authenticate the transaction.",
		DESCRIPTION_PRIVATE_KEY: "Enter your private key to authenticate the transaction.",
		DESCRIPTION_SECRET: "Enter your secret to authenticate the transaction.",
		DESCRIPTION_WIF: "Enter your WIF to authenticate the transaction.",
		TITLE: "Authenticate",
	},
	BROADCASTING: "Broadcasting transaction to the network",
	CONFIRMATIONS: "Confirmations",
	CONFIRMATIONS_COUNT: "{{count}} Confirmations",
	CONFIRMED: "Confirmed",
	CONTACT_SEACH: {
		DESCRIPTION: "Find and select preferred address from you saved wallets",
		TITLE: "My addresses",
	},
	CORE: "CORE",
	CRYPTOASSET: "Cryptoasset",
	DELEGATE: "Delegate",
	DELEGATE_NAME: "Delegate Name",
	DELEGATE_PUBLICKEY: "Delegate PublicKey",
	DESCRIPTION: "Description",
	DISPLAY_NAME: "Display Name",
	ENCRYPTION_PASSWORD: "Encryption Password",
	ERROR: {
		DESCRIPTION:
			"An error occurred while sending your transaction. Please go 'Back' and try again, or click 'Close' to return to the wallet.",
		TITLE: "Transaction Error",
	},
	EXPIRATION: {
		HEIGHT: "Block Height Expiration",
		TIMESTAMP: "Timestamp Expiration",
	},
	EXPORT: {
		DESCRIPTION: "Export your wallet's transaction history.",
		EMPTY: {
			DESCRIPTION: "No transactions could be found for the selected period.",
		},
		FORM: {
			ALL: "All",
			COLUMNS: "Columns",
			COMMA: "Comma",
			CRYPTO_AMOUNT: "Crypto Amount",
			CSV_SETTINGS: "CSV Settings",
			CURRENT_MONTH: "Month to Date",
			CURRENT_QUARTER: "Quarter to Date",
			CURRENT_YEAR: "Year to Date",
			CUSTOM: "Custom",
			DATE_RANGE: "Date Range",
			DELIMITER: "Delimiter",
			FIAT_AMOUNT: "Fiat Amount",
			INCLUDE_HEADER_ROW: "Include Header Row",
			LASTYEAR: "Last Year",
			LAST_MONTH: "Last Month",
			LAST_QUARTER: "Last Quarter",
			PIPE: "Pipe",
			SEMICOLON: "Semicolon",
			SENDER_RECIPIENT: "Sender / Recipient",
			SPACE: "Space",
			TAB: "Tab",
			TRANSACTIONS: "Transactions",
			TRANSACTION_DATE: "Transaction Date",
			TRANSACTION_ID: "Transaction ID",
		},
		PROGRESS: {
			DESCRIPTION: "{{count}} transactions have been retrieved so far, please wait.",
			DESCRIPTION_START: "The data is being prepared. This might take a while, please wait.",
			FETCHED_PARTIALLY:
				"We've successfully retrieved some transactions, but encountered an issue along the way. You can download the partial file or retry.",
		},
		SUCCESS: {
			DESCRIPTION: "{{count}} transactions have been retrieved and are ready to be exported.",
		},
		TITLE: "Transaction History",
	},
	FEES: {
		AVERAGE: "Average",
		FAST: "Fast",
		SLOW: "Slow",
	},
	HINT_AMOUNT: "Including {{amount}} {{currency}} sent to itself",
	ID: "ID",
	INCOMING: "Incoming",
	INPUT_FEE_VIEW_TYPE: {
		ADVANCED: "Advanced",
		SIMPLE: "Simple",
	},
	INPUT_IPFS_HASH: {
		VALIDATION: {
			NOT_VALID: "The IPFS hash is not valid",
		},
	},
	INVALID_MNEMONIC: "Invalid Mnemonic",
	INVALID_URL: "Invalid URL",
	IPFS_HASH: "IPFS Hash",
	IPFS_NOT_FOUND: "Unable to find ipfs data for transaction [{{transactionId}}]",
	LEDGER_CONFIRMATION: {
		DESCRIPTION:
			"Please review and verify the information on your Ledger device. Choose Accept to complete your transaction.",
		LOADING_MESSAGE: "Waiting for confirmation …",
		REJECTED: "The operation has been rejected by the user",
		TITLE: "Confirm Your Transaction",
	},
	LINK_TYPES: {
		BITBUCKET: "BitBucket",
		DISCORD: "Discord",
		FACEBOOK: "Facebook",
		FLICKR: "Flickr",
		GITHUB: "GitHub",
		GITLAB: "GitLab",
		INSTAGRAM: "Instagram",
		LINKEDIN: "LinkedIn",
		MEDIUM: "Medium",
		NPM: "Npm",
		REDDIT: "Reddit",
		SLACK: "Slack",
		TELEGRAM: "Telegram",
		TWITTER: "Twitter",
		VIMEO: "Vimeo",
		WECHAT: "Wechat",
		YOUTUBE: "YouTube",
	},
	MAGISTRATE: "Magistrate",
	MEMO: "Memo",
	MNEMONIC: "Mnemonic",
	MODAL_CONFIRM_REMOVE_PENDING_TRANSACTION: {
		DESCRIPTION:
			"Are you sure you want to remove {{type}} from the transaction pool? This action cannot be undone.",
		TITLE: "Remove Transaction",
	},
	MODAL_CONFIRM_SEND_TRANSACTION: {
		DESCRIPTION:
			"You have unconfirmed transactions which will affect your balance when confirmed. Are you sure you wish to continue?",
		TITLE: "Confirm Transaction",
	},
	MODAL_DELEGATE_REGISTRATION_DETAIL: {
		TITLE: "Delegate Registration",
	},
	MODAL_DELEGATE_RESIGNATION_DETAIL: {
		TITLE: "Delegate Resignation",
	},
	MODAL_FEE_WARNING: {
		DESCRIPTION: {
			TOO_HIGH:
				"You have selected a high fee. Your transaction can be confirmed with a lower fee. Do you wish to continue anyway?",
			TOO_LOW:
				"You have selected a low fee. Your transaction may never be confirmed. Do you wish to continue anyway?",
		},
		DO_NOT_WARN: "Don’t warn me about fees again",
		TITLE: "Fee Warning",
	},
	MODAL_IPFS_DETAIL: {
		TITLE: "Transaction IPFS Hash",
	},
	MODAL_MULTISIGNATURE_DETAIL: {
		STEP_1: {
			TITLE: "Multisignature",
		},
		STEP_2: {
			DESCRIPTION: "Enter your passphrase in order to sign the Multisignature transaction.",
			TITLE: "Multisignature Passphrase",
		},
		STEP_3: {
			DESCRIPTION: "Your signature has been confirmed and sent successfully.",
			TITLE: "Transaction Sent",
		},
		WAITING_FOR_SIGNATURES: "Waiting for Signatures",
	},
	MODAL_OVERWRITE_VALUES: {
		CLEAR_PREFILLED_LABEL: "Remove prefilled data not included in QR",
		TITLE: "Overwrite Data",
		WARNING:
			"The data scanned via QR conflicts with pre-filled input fields. Please confirm if you wish to overwrite the following data.",
	},
	MODAL_QR_CODE: {
		DESCRIPTION: "Hold a compatible QR code in front of your device's camera to scan the information",
		ERROR: "Something went wrong.",
		INVALID_QR_CODE: "The uploaded QR code is invalid.",
		PERMISSION_ERROR: {
			DESCRIPTION:
				"You have blocked ARK Vault from accessing your camera. In order to scan a QR code, please allow access to your camera from your browser settings.",
			TITLE: "Camera Permission Denied",
		},
		TITLE: "Scan QR-Code",
		UPLOAD: "Upload Image",
	},
	MODAL_SEARCH_RECIPIENT: {
		DESCRIPTION: "Locate and select the recipient address.",
		SEARCH_PLACEHOLDER: "Enter name or address",
		TITLE: "Recipient Search",
	},
	MODAL_SECOND_SIGNATURE_DETAIL: {
		TITLE: "Second Signature",
	},
	MODAL_TRANSACTION_DETAILS: {
		TITLE: "Transaction Details",
	},
	MODAL_TRANSFER_DETAIL: {
		TITLE: "Transfer",
	},
	MODAL_VOTE_DETAIL: {
		TITLE: "Delegate Vote",
	},
	MULTIPLE: "Multiple",
	MULTIPLE_COUNT: "Multiple ({{count}})",
	MULTISIGNATURE: {
		ADD_PARTICIPANT: "Add Participant",
		AWAITING_BY: "by",
		AWAITING_CONFIRMATIONS: "Awaiting confirmations",
		AWAITING_FINAL_SIGNATURE: "Awaiting final signature",
		AWAITING_FINAL_SIGNATURE_AND_BROADCAST: "Awaiting broadcast",
		AWAITING_OTHER_SIGNATURE_COUNT_one: "Awaiting {{count}} other signature",
		AWAITING_OTHER_SIGNATURE_COUNT_other: "Awaiting {{count}} other signatures",
		AWAITING_OUR_BROADCAST: "Awaiting our broadcast",
		AWAITING_OUR_SIGNATURE: "Awaiting our signature",
		AWAITING_SOME_SIGNATURES: "One or more transactions are awaiting our signature.",
		ERROR: {
			ADDRESS_ALREADY_ADDED: "The address is already in the list",
			ADDRESS_NOT_FOUND: "The address could not be found",
			FAILED_TO_BROADCAST: "Failed to broadcast your transaction",
			FAILED_TO_SIGN: "Failed to sign the transaction",
			PUBLIC_KEY_NOT_FOUND: "The public key could not be found",
		},
		GENERATED_ADDRESS: "Multisignature Address",
		MIN_SIGNATURES: "Minimum Required Signatures",
		OUT_OF_LENGTH: "out of {{ length }}",
		PARTICIPANT: "Multisignature Participant",
		PARTICIPANTS: "Multisignature Participants",
		PARTICIPANTS_CAN_REMOVE_PENDING_MUSIG: "Only participants can remove pending transactions.",
		PARTICIPANTS_COUNT: "Multisignature Participants ({{count}})",
		"PARTICIPANT_#": "Participant #{{count}}",
		READY: "Ready to broadcast",
		REMOVE_NOT_ALLOWED: "Your own address cannot be removed",
		SELECT_PARTICIPANT_DESCRIPTION: "Find and select a participant from your contacts and wallets.",
		SELECT_PARTICIPANT_TITLE: "Select Participant",
	},
	NAME: "Name",
	NETWORK: "Network",
	NOT_FOUND: "Unable to find transaction for [{{transactionId}}]",
	NOT_YET_CONFIRMED: "Not yet confirmed",
	OUTGOING: "Outgoing",
	PAGE_DELEGATE_REGISTRATION: {
		FORM_STEP: {
			DESCRIPTION: "Register a new Delegate address on the network below.",
			TITLE: "Register Delegate",
			WARNING: "The Delegate name is permanent and cannot be modified later. It is registered on the network.",
		},
	},
	PAGE_DELEGATE_RESIGNATION: {
		FORM_STEP: {
			DESCRIPTION: "This transaction type permanently retires a Delegate address.",
			TITLE: "Resign Delegate",
			WARNING: "This action is permanent and cannot be undone. It is registered on the network.",
		},
	},
	PAGE_IPFS: {
		FIRST_STEP: {
			DESCRIPTION: "Store an IPFS hash on the network.",
			TITLE: "IPFS",
		},
		SECOND_STEP: {
			DESCRIPTION: "Review the IPFS transaction details before sending",
			TITLE: "Transaction Review",
		},
	},
	PAGE_MULTISIGNATURE: {
		FORM_STEP: {
			DESCRIPTION: "Register Multisignature details below.",
			TITLE: "Multisignature Registration",
		},
	},
	PAGE_SECOND_SIGNATURE: {
		GENERATION_STEP: {
			DESCRIPTION: "You can additionaly secure your address with a second mnemonic passphrase.",
			TITLE: "Register Second Signature",
			WARNING:
				"Before creating the second mnemonic, we strongly recommend that you save it, as its loss will lead to a loss of access to your money.",
		},
		PASSPHRASE_CONFIRMATION_STEP: {
			SUBTITLE: "Confirm your mnemonic passphrase to continue.",
			TITLE: "Confirm Your Passphrase",
		},
		PASSPHRASE_STEP: {
			COPY_OR_DOWNLOAD: {
				DESCRIPTION: "You can copy or download your mnemonic, but store it safely.",
				TITLE: "Copy or Download Mnemonic Passphrase",
			},
			TITLE: "Your Second Signature",
			WARNING:
				"You are responsible for storing and protecting this mnemonic passphrase offline. ARK Vault cannot reveal this to you at a later time. If you lose this mnemonic passphrase, you will lose your funds.",
		},
	},
	PAGE_TRANSACTION_SEND: {
		FORM_STEP: {
			DESCRIPTION: "Enter details below to send your transaction.",
			FEE_UPDATE: "The selected fee has been changed",
			MULTIPLE_UNAVAILBLE: "Multiple Recipient Transactions are not available from Ledger wallets.",
			SCAN: "Scan",
			SCAN_FULL: "Scan QR-Code",
			TITLE: "Send {{ticker}}",
		},
		NETWORK_STEP: {
			SUBTITLE: "Select a cryptoasset to send funds from.",
			TITLE: "Select a Cryptoasset",
		},
	},
	PAGE_VOTE: {
		FORM_STEP: {
			DESCRIPTION: "Select a fee to continue.",
			TITLE: "Vote Transaction",
		},
	},
	PARTICIPANTS: "Participants",
	PENDING: {
		DESCRIPTION:
			"Your transaction was successfully sent. Please monitor the blockchain to ensure your transaction is confirmed and processed. The following  is the relevant information for your transaction:",
		STATUS_TEXT: "This transaction is pending confirmation",
		TITLE: "Pending Confirmation",
	},
	PHOTO_VIDEO: {
		DESCRIPTION: "Get more users and add more information about yourself",
		TITLE: "Photo and Video",
	},
	QR_CODE_SUCCESS: "QR code was successfully read.",
	RECEIVED: "Received",
	RECIPIENT: "Recipient",
	RECIPIENTS: "Recipients",
	RECIPIENTS_COUNT: "Recipients ({{count}})",
	RECIPIENTS_HELPTEXT: "A multiple recipient transaction allows up to {{count}} recipients in one transaction",
	REGISTRATION: "Registration",
	REGISTRATION_TYPE: "Registration Type",
	REPOSITORIES: {
		DESCRIPTION: "Show your projects through your repository",
		TITLE: "Repository",
	},
	RETURN: "Return",
	REVIEW_STEP: {
		DESCRIPTION: "Review the transaction details below.",
		TITLE: "Transaction Review",
	},
	SECOND_MNEMONIC: "2nd Mnemonic",
	SECOND_SECRET: "2nd Secret",
	SENDER: "Sender",
	SEND_ALL: "Send All",
	SENT: "Sent",
	SIGN: "Sign",
	SIGNATURES: "Signatures",
	SIGN_CONTINUE: "Sign & Continue",
	SINGLE: "Single",
	SOCIAL_MEDIA: {
		DESCRIPTION: "Tell people more about yourself through social media",
		TITLE: "Social Media",
	},
	STATUS: "Status",
	SUCCESS: {
		CONFIRMED: "Transaction Confirmed",
		CREATED: "Transaction Created",
		DESCRIPTION:
			"Your transaction has been sent successfully. Please monitor the blockchain to ensure your transaction is confirmed and processed. The following is relevant information for your transaction:",
		MUSIG_DESCRIPTION:
			"Your transaction has been created successfully. Participants can now sign the transaction to broadcast it to the network. The following is relevant information for your transaction:",
		TITLE: "Transaction Sent",
	},
	SUMMARY: "Transaction Summary",
	TIMESTAMP: "Timestamp",
	TOTAL_AMOUNT: "Total Amount",
	TRANSACTION: "Transaction",
	TRANSACTIONS_AMOUNT: "Transaction(s) Amount",
	TRANSACTION_AMOUNT: "Transaction Amount",
	TRANSACTION_DETAILS: "Transaction Details",
	TRANSACTION_FEE: "Transaction Fee",
	TRANSACTION_ID: "Transaction ID",
	TRANSACTION_REMOVED: "Transaction successfully removed",
	TRANSACTION_SIGNED: "Transaction Signed",
	TRANSACTION_TYPE: "Transaction Type",
	TRANSACTION_TYPES: {
		DELEGATE_REGISTRATION: "Delegate Registration",
		DELEGATE_RESIGNATION: "Delegate Resignation",
		HTLC_CLAIM: "Timelock Claim",
		HTLC_LOCK: "Timelock",
		HTLC_REFUND: "Timelock Refund",
		IPFS: "IPFS",
		MAGISTRATE: "Magistrate",
		MULTI_PAYMENT: "Multipayment",
		MULTI_SIGNATURE: "Multisignature",
		SECOND_SIGNATURE: "Second Signature",
		TRANSFER: "Transfer",
		UNLOCK_TOKEN: "Unlock Balance",
		UNVOTE: "Unvote",
		VOTE: "Vote",
		VOTE_COMBINATION: "Vote Swap",
	},

	TYPE: "Type",

	UNLOCK_TOKENS: {
		EMPTY_MESSAGE: "Your wallet doesn’t have any locked balance.",
		ERROR_MESSAGE: "Unable to retrieve unlockable balances. Click <RetryLink/> to retry.",
		INSUFFICIENT_BALANCE_HINT: "You do not have enough {{currency}} to complete this transaction.",
		LOCKED: "Locked",
		LOCKED_BALANCE: "Locked Balance",
		REVIEW: {
			TITLE: "Unlock Balance",
		},
		SELECT: {
			DESCRIPTION:
				"View the details of your locked balances and waiting periods within the table below. Select the balances you wish to unlock once the waiting period has expired.",
			TITLE: "Locked Balance",
		},
		SUMMARY: {
			DESCRIPTION: "Your balance unlock transaction has been sent successfully.",
			TITLE: "Successfully Unlocked Balance",
		},
		UNLOCK: "Unlock",
		UNLOCKABLE: "Unlockable",
	},
	UNVOTES: "Unvotes",
	UNVOTES_COUNT: "Unvotes ({{count}})",
	UNVOTES_COUNT_one: "Unvote",
	VALIDATION: {
		ALREADY_VOTING: "{{wallet}} is already voting for {{delegate}}.",
		AMOUNT_BELOW_MINIMUM: "The amount is below the minimum ({{min}} {{ coinId }})",
		COIN_MISMATCH: "data is for another coin.",
		COIN_MISSING: "coin parameter is missing.",
		COIN_NOT_SUPPORTED: "coin <strong>{{coin}}</strong> is not supported.",
		DELEGATE_MISSING: "delegate name or public key parameter is missing.",
		DELEGATE_NOT_FOUND: "delegate <strong>{{delegate}}</strong> could not be found.",
		DELEGATE_OR_PUBLICKEY:
			"both delegate name and public key were provided in url. Please use either one or the other.",
		DELEGATE_RESIGNED: "delegate <strong>{{delegate}}</strong> is resigned.",
		FEE_NEGATIVE: "Fee cannot be negative",
		INVALID_ADDRESS_OR_NETWORK_MISMATCH: "The provided address is invalid or belongs to another network",
		INVALID_QR: "Invalid QR",
		INVALID_QR_REASON: "Invalid QR: {{reason}}",
		INVALID_URI: "Invalid URI",
		LOW_BALANCE: "The balance is too low",
		LOW_BALANCE_AMOUNT: "The balance is too low ({{balance}} {{ coinId }})",
		MESSAGE_MISSING: "message parameter is missing.",
		METHOD_MISSING: "method parameter is missing",
		METHOD_NOT_SUPPORTED: "method <strong>{{method}}</strong> is not supported.",
		NETHASH_NOT_ENABLED: "network with nethash <strong>{{nethash}}</strong> is not enabled or available.",
		NETWORK_INVALID: "network <strong>{{network}}</strong> is invalid.",
		NETWORK_MISMATCH: "data belongs to another network.",
		NETWORK_NOT_ENABLED: "network <strong>{{network}}</strong> is not enabled.",
		NETWORK_NO_WALLETS:
			"the current profile has no wallets available for the <strong>{{network}}</strong> network.",
		NETWORK_OR_NETHASH_MISSING: "network or nethash parameter is missing.",
		SIGNATORY_MISSING: "signatory is missing",
		SIGNATURE_MISSING: "signature is missing",
	},
	VIEW_RECIPIENTS_LIST: "View Full List",
	VOTER: "Voter",
	VOTES: "Votes",
	VOTES_COUNT: "Votes ({{count}})",
	VOTES_COUNT_one: "Vote",
	WAITING: "Waiting",
	WEBSITE: "Website",
	YOUR_ADDRESS: "Your address",
};
