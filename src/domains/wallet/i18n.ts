export const translations = {
	ADDRESSES_SIDE_PANEL: {
		DELETE_INFO: "You can delete your addresses from the app here.",
		MANAGE_HINT: "You can manage and remove your addresses here.",
		NO_SEARCH_RESULTS: "Your search did not match any results.",
		SEARCH_BY: "Search by Name or Address",
		TITLE: "Choose Address",
		TOGGLE: {
			MULTIPLE_VIEW: "Multiple View",
			SINGLE_VIEW: "Single View",
		},
	},
	ADDRESS_NAME: "Address Name",
	CONNECT_LEDGER: {
		DESCRIPTION: "Connect your Ledger device, open the ARK app, and authorize the connection with ARK Vault.",
		HEADER: "Connect and Authorize Ledger Device",
		TITLE: "Connect Ledger Device",
		WAITING_DEVICE: "Waiting for confirmation ...",
	},

	MESSAGE: "Message",

	MNEMONIC_VERIFICATION: {
		SELECT_WORD: "Select the {{position}}{{ordinalIndicator}} Word",
		WORD_NUMBER: "The {{position}}{{ordinalIndicator}} Word",
		WORD_REQUIRED: "Word required",
		WRONG_WORD: "Incorrect word entered",
	},

	MODAL_DELETE_WALLET: {
		DESCRIPTION:
			"Are you sure you wish to delete the selected address? Before deleting, make sure the mnemonic passphrase is secured safely.",
		TITLE: "Delete Address",
	},

	// @TODO: Remove this once the new wallet ledger create flow is complete
	MODAL_LEDGER_WALLET: {
		COMPATIBILITY_ERROR:
			"ARK Vault requires the use of a chromium based browser when using a Ledger device. Please use another browser like Chrome.",
		CONNECT_DEVICE: "Connect your Ledger and confirm input.",
		CONNECT_DEVICE_MODEL: "Connect your {{model}} and confirm input.",
		CONNECT_SUCCESS: "Successfully connected.",
		DEVICE_NOT_AVAILABLE: "Unable to detect Ledger device.",
		DEVICE_NOT_SUPPORTED:
			"A <bold>{{connectedModel}}</bold> is connected, but this operation requires a <bold>{{supportedModel}}</bold>. Connect the appropriate device to continue.",
		GENERIC_CONNECTION_ERROR:
			"Unable to connect to Ledger device. Please ensure that all other applications that connect to your Ledger are closed.",
		LEDGER_NANO_S: "Ledger Nano S",
		LEDGER_NANO_S_PLUS: "Ledger Nano S Plus",
		LEDGER_NANO_X: "Ledger Nano X",
		NO_DEVICE_FOUND: "Ledger device has not been found in time.",
		OPEN_APP: "Open the {{coin}} app on your device ...",
		TITLE: "Ledger Address",
		UPDATE_ERROR: "The {{coin}} app version is {{version}}. Please update the {{coin}} app via Ledger Live.",
		WAITING_DEVICE: "Waiting for Ledger ...",
	},

	MODAL_NAME_WALLET: {
		DESCRIPTION: "Select a personalized address name, visible only to you",
		TITLE: "Address Name",
	},

	MODAL_RECEIVE_FUNDS: {
		DESCRIPTION: "Specify and confirm the amount to request.",
		DOWNLOAD_QR_CODE: "Download QR-Code",
		SPECIFY_AMOUNT: "Specify Amount",
		TITLE: "Receive Funds",
		WARNING:
			"Please note that you have exceeded the number of characters allowed, anything over {{maxLength}} characters will not appear in memos.",
	},

	MODAL_SELECT_ACCOUNT: {
		DESCRIPTION: "Locate and select the address for receiving funds.",
		SEARCH_PLACEHOLDER: "Enter name or address",
		TITLE: "Select Account",
	},

	MODAL_WALLET_ENCRYPTION: {
		DESCRIPTION:
			"You are about to register a second passphrase while having your current {{importType}} encrypted with a custom password. Continuing with the second signature registration will automatically remove the encryption once the transaction is sent. Ensure your {{importType}} is backed up before proceeding. You will have to re-import your address if you want to use an encryption password again.",
		TITLE: "Address Encryption Removal",
	},

	PAGE_CREATE_WALLET: {
		METHOD_STEP: {
			HD_ADDRESS_TITLE: "A single mnemonic to access one or more addresses",
			REGULAR_ADDRESS_DESCRIPTION: "A single mnemonic to access a single address",
			REGULAR_ADDRESS_TITLE: "Regular Address",
			SUBTITLE: "Select a cryptoasset to create your new wallet address.",
			SUBTITLE_WITH_HD: "Pick the address type to generate to new address",
			TITLE: "Create New Address",
			USE_ADDITIONAL_ADDRESSES: "Want to add additional addresses to your existing HD Wallet?",
			USE_IMPORT: "Use “<importLink/>” instead.",
		},
		NETWORK_STEP: {
			GENERATION_ERROR:
				"An error occurred while creating your new address, please try again. If the error persists, kindly get in touch with our support team.",
			SUBTITLE: "Select a cryptoasset to create your new address.",
			TITLE: "Select a Cryptoasset",
		},

		PASSPHRASE_CONFIRMATION_STEP: {
			PASSPHRASE_DISCLAIMER: "I am aware that if I lose my passphrase, I will lose access to my funds.",
			SUBTITLE:
				"Confirm that you’ve saved your secret passphrase by correctly entering the word in the designated input field below.",
			TITLE: "Confirm Your Passphrase",
		},

		PASSPHRASE_STEP: {
			COPY_OR_DOWNLOAD: {
				DESCRIPTION: "You can copy or download your mnemonic, but store it safely.",
				TITLE: "Copy or Download Mnemonic",
			},
			ENCRYPTION: {
				DESCRIPTION:
					"Set an encryption password to use in place of your mnemonic passphrase. Note that you must still record and keep your mnemonic passphrase safe as losing this will result in you losing all access to your funds.",
				TITLE: "Use Address Encryption",
			},
			TITLE: "Your Passphrase",
			WARNING:
				"You are responsible for storing and protecting this mnemonic passphrase offline. ARK Vault cannot reveal this to you at a later time. If you lose this mnemonic passphrase, you will lose your funds.",
		},

		PROCESS_COMPLETED_STEP: {
			SUBTITLE: "The address has been successfully created.",
			TITLE: "Completed",
		},

		TITLE: "Create Address",
	},

	PAGE_IMPORT_WALLET: {
		CANCELLING_STATE: {
			TITLE: "Cancelling Ledger Import, please wait ...",
		},

		ENCRYPT_PASSWORD_STEP: {
			CONFIRM_PASSWORD_LABEL: "Confirm Encryption Password",
			PASSWORD_LABEL: "Encryption Password",
			TITLE: "Encryption Password",
			WARNING:
				"This password does not replace your mnemonic passphrase. You must ensure that your passphrase is properly recorded and backed up so that you do not lose access to your funds. You cannot use your encryption password to restore your profile, so it is vital that you have your mnemonic passphrase readily available should you run into any issues (such as losing access to your local profile or clearing your browser's cache).",
		},

		HD_WALLET_ENTER_MNEMONIC_STEP: {
			SUBTITLE: "Import and add new addresses using your HD Wallet mnemonic.",
			TITLE: "Enter Mnemonic",
		},

		HD_WALLET_SELECT_ACCOUNT_STEP: {
			SUBTITLE: "Import addresses by choosing an existing HD wallet or adding a new one.",
			TITLE: "Select or Import New HD Wallet",
		},

		HD_WALLET_SELECT_ADDRESS_STEP: {
			LOADING_ADDRESSES: "Loading Addresses",
			LOAD_MORE_ADDRESSES: "Load More Addresses",
			SUBTITLE: "Select the addresses that you want to import.",
			TITLE: "HD Addresses",
		},

		HD_WALLET_SUMMARY_STEP: {
			DETAILS_LABEL: "HD Wallet Details",
			SUBTITLE: "Your HD Wallet addresses were successfully imported.",
			TITLE: "Import Completed",
		},

		IMPORT_DETAIL_STEP: {
			ENCRYPTION: {
				CHECKBOX: "I understand and accept responsibility.",
				DESCRIPTION:
					"Set an encryption password to replace your mnemonic passphrase when signing transactions and messages.",
				NOT_AVAILABLE: "Encryption not available for this import type.",
				TITLE: "Use Address Encryption",
				WARNING:
					"You must still securely store your mnemonic passphrase. Losing it will result in permanent loss of access to your funds!",
			},
			MNEMONIC_TIP: {
				GUIDELINES_1: "Ensure all words are in lowercase.",
				GUIDELINES_2: "Insert a space between each word.",
				GUIDELINES_3: "Verify that all words are spelled correctly.",
				GUIDELINES_4:
					"If copying and pasting, ensure no extra whitespace is added at the end of the copied text.",
				GUIDELINES_TITLE: "Please follow these guidelines when inputting your mnemonic into ARK Vault:",
				TITLE: "Need help with importing?",
			},
		},

		LEDGER_CONNECTION_STEP: {
			SUBTITLE: "Open the app on your Ledger and check for details.",
			TITLE: "Open App on Ledger",
		},

		LEDGER_IMPORT_STEP: {
			SUBTITLE_one: "Your Ledger address has been imported.",
			SUBTITLE_other: "Your Ledger addresses have been imported.",
			TITLE: "Import Completed",
		},

		LEDGER_SCAN_STEP: {
			ACCOUNTS: "Accounts",
			ADD_NEW_ADDRESS: "Add New Address",
			LOADED_ADDRESSES: "Loaded <strong>{{count}}</strong> Addresses",
			LOADED_SINGLE_ADDRESS: "Loaded <strong>1</strong> Address",
			LOADING_ADDRESSES: "Loading <strong>{{count}}</strong> Addresses",
			SHOW_ALL: "Show All ({{count}})",
			SUBTITLE: "Select the addresses that you want to import.",
			TITLE: "Ledger Addresses",
		},

		METHOD_STEP: {
			ADDRESS_DESCRIPTION: "Import an address by entering your public address.",
			HD_WALLET_DESCRIPTION: "Import an HD wallet and add addresses as needed",
			HD_WALLET_TITLE: "HD Wallet",
			LEDGER_DESCRIPTION: "Import address(es) via your Ledger hardware wallet.",
			MNEMONIC_DESCRIPTION: "Import an address by entering your 12 or 24 mnemonic phrase.",
			MNEMONIC_TITLE: "Import Mnemonic",
			PUBLIC_KEY_DESCRIPTION: "Import an address by entering your public key.",
			PUBLIC_KEY_TITLE: "Import Public Key",
			SECRET_DESCRIPTION: "Import an address by entering your custom password.",
			SECRET_TITLE: "Import Secret",
			SUBTITLE: "Select the method you want to use to import your address.",
			TITLE: "Import",
		},

		PASSPHRASE_CONFIRMATION_STEP: {
			SUBTITLE: "Confirm your password to continue.",
			TITLE: "Confirm your passphrase",
		},

		SUCCESS_STEP: {
			SUBTITLE: "The address has been successfully imported.",
			TITLE: "Import Completed",
		},

		TITLE: "Import Address",

		VALIDATION: {
			DECRYPT_WIF_ASSERTION: "Failed to decrypt WIF. Please check your password.",
			INVALID_MNEMONIC: "The given value is not BIP39 compliant.",
			INVALID_PRIVATE_KEY: "Invalid Private Key.",
			INVALID_PUBLIC_KEY: "Invalid Public Key.",
			INVALID_SECRET: "The given value is BIP39 compliant. Please change Import Type to 'Mnemonic'.",
			INVALID_WIF: "Invalid WIF.",
		},
	},

	PAGE_WALLET_DETAILS: {
		ADDITIONAL_OPTIONS: "Additional Options",
		COPY_ADDRESS: "Copy Address",
		COPY_PUBLIC_KEY: "Copy Public Key",
		MANAGE_VOTES_FOR_YOUR_ADDRESSES: "Manage votes for your addresses",
		OPTIONS: {
			ADDRESS_NAME: "Address Name",
			DELETE: "Delete",
			MULTISIGNATURE: "Multisignature",
			RECEIVE_FUNDS: "Receive Funds",
			RECEIVE_FUNDS_QR: "QR",
			REGISTER_USERNAME: "Username",
			REGISTER_VALIDATOR: "Validator",
			RESIGN_USERNAME: "Resign Username",
			RESIGN_VALIDATOR: "Resign Validator",
			SIGN_MESSAGE: "Sign Message",
			STORE_HASH: "Store Hash",
			TRANSACTION_HISTORY: "Transaction History",
			UPDATE_VALIDATOR: "Update Validator",
			VERIFY_MESSAGE: "Verify Message",
		},

		PENDING_TRANSACTIONS: "Pending Transactions",
		PRIMARY_OPTIONS: "Manage Address",
		REGISTRATION_OPTIONS: "Register",

		STARRED_FIRST: "Show starred wallets at the top",

		STAR_WALLET: "Star",

		UNSTAR_WALLET: "Unstar",

		VOTES: {
			ACTIVE_COUNT: "Active {{count}}",
			ACTIVE_one: "Active",
			ACTIVE_other: "All Active",
			EMPTY_DESCRIPTION: "You have not voted for a Validator yet.",
			LOCKED_UNVOTES: "Locked Unvotes",
			LOCKED_VOTES: "Locked Votes",
			MULTIVOTE: "Multivote",
			NOT_FORGING_COUNT: "{{count}} of your validators are currently not in a forging position.",
			NOT_FORGING_one: "Your validator is currently not in a forging position.",
			NOT_FORGING_other: "Your validators are currently not in a forging position.",
			RESIGNED_COUNT: "Resigned {{count}}",
			RESIGNED_one: "Resigned",
			RESIGNED_other: "All Resigned",
			STANDBY_COUNT: "Standby {{count}}",
			STANDBY_one: "Standby",
			STANDBY_other: "All Standby",
			TITLE_one: "My Vote",
			TITLE_other: "My Votes",
			VALIDATOR_STATUS: "Validator Status",
			VOTING_FOR: "Voting for",
		},
	},

	SIGNATURE: "Signature",

	SINGLE_ADDRESS_HINT:
		"You're automatically viewing the latest created/imported address. You can select here to make changes.",

	STATUS: {
		ACTIVE: "Active",
		RESIGNED: "Resigned",
		STANDBY: "Standby",
	},

	UPDATE_ADDRESS_DATA: "Update Address Data",

	UPDATING_ADDRESS_DATA: "Updating Address Data",

	VALIDATION: {
		ACCOUNT_NAME_ASSIGNED: "The name '{{name}}' is already assigned.",
		ALIAS_ASSIGNED: "The name '{{alias}}' is already assigned to another wallet.",
	},
};
