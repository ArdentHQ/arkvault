export const translations = {
	CONNECT_LEDGER: {
		DESCRIPTION: "Connect your Ledger device, open the ARK app, and authorize the connection with ARK Vault.",
		HEADER: "Connect and Authorize Ledger Device",
		TITLE: "Connect Ledger Device",
		WAITING_DEVICE: "Waiting for confirmation  ...",
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
			"Are you sure you wish to delete the selected wallet? Before deleting, make sure the mnemonic passphrase is secured safely.",
		TITLE: "Delete Wallet",
	},

	// @TODO: Remove this once the new wallet ledger create flow is complete
	MODAL_LEDGER_WALLET: {
		COMPATIBILITY_ERROR:
			"ARK Vault requires the use of a chromium based browser when using a Ledger device. Please use another browser like Chrome.",
		CONNECT_DEVICE: "Connect your Ledger and confirm input.",
		CONNECT_DEVICE_MODEL: "Connect your {{model}} and confirm input.",
		CONNECT_SUCCESS: "Successfully connected",
		DEVICE_NOT_AVAILABLE: "Unable to detect Ledger device",
		DEVICE_NOT_SUPPORTED:
			"A <bold>{{connectedModel}}</bold> is connected, but his operation requires a <bold>{{supportedModel}}</bold>. Connect the appropriate device to continue.",
		GENERIC_CONNECTION_ERROR:
			"Unable to connect to Ledger device. Please ensure that all other applications that connect to your Ledger are closed.",
		LEDGER_NANO_S: "Ledger Nano S",
		LEDGER_NANO_X: "Ledger Nano X",
		NO_DEVICE_FOUND: "Ledger device has not been found in time",
		OPEN_APP: "Open the {{coin}} app on your device ...",
		TITLE: "Ledger Wallet",
		UPDATE_ERROR: "The {{coin}} app version is {{version}}. Please update the {{coin}} app via Ledger Live.",
		WAITING_DEVICE: "Waiting for Ledger ...",
	},

	MODAL_NAME_WALLET: {
		DESCRIPTION: "Enter a name for this wallet address (only visible to you).",
		TITLE: "Wallet Name",
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
			"You are about to register a second passphrase while having your current {{importType}} encrypted with a custom password. Continuing with the second signature registration will automatically remove the encryption once the transaction is sent. Ensure your {{importType}} is backed up before proceeding. You will have to re-import your wallet if you want to use an encryption password again.",
		TITLE: "Wallet Encryption Removal",
	},

	MODAL_WALLET_UPDATE: {
		DESCRIPTION_1: "A new update has been released for your wallet. You can download or postpone the update.",
		DESCRIPTION_2: "The update has been successfully downloaded and is ready to be installed.",
		TITLE: "Wallet Update {{version}}",
	},

	PAGE_CREATE_WALLET: {
		NETWORK_STEP: {
			GENERATION_ERROR:
				"An error occurred while creating your new address, please try again. If the error persists, kindly get in touch with our support team.",
			SUBTITLE: "Select a cryptoasset to create your new wallet address.",
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
				TITLE: "Use Wallet Encryption",
			},
			TITLE: "Your Passphrase",
			WARNING:
				"You are responsible for storing and protecting this mnemonic passphrase offline. ARK Vault cannot reveal this to you at a later time. If you lose this mnemonic passphrase, you will lose your funds.",
		},

		PROCESS_COMPLETED_STEP: {
			SUBTITLE: "The wallet address has been successfully created.",
			TITLE: "Completed",
		},

		TITLE: "Create Wallet",
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

		LEDGER_CONNECTION_STEP: {
			SUBTITLE: "Open the app on your Ledger and check for details.",
			TITLE: "Open App on Ledger",
		},

		LEDGER_IMPORT_STEP: {
			SUBTITLE_one: "Your Ledger address has been imported.",
			SUBTITLE_other: "Your Ledger addresses have been imported.",
			TITLE: "Completed",
		},

		LEDGER_SCAN_STEP: {
			ADD_NEW_ADDRESS: "Add New Address",
			LOADED_SINGLE_WALLET: "Loaded <strong>1</strong> Wallet",
			LOADED_WALLETS: "Loaded <strong>{{count}}</strong> Wallets",
			SHOW_ALL: "Show All ({{count}})",
			SUBTITLE: "Select the addresses that you want to import.",
			TITLE: "Addresses",
		},

		METHOD_STEP: {
			ENCRYPTION: {
				DESCRIPTION:
					"Set an encryption password to use in place of your mnemonic passphrase. Note that you must still record and keep your mnemonic passphrase safe as losing this will result in you losing all access to your funds.",
				NOT_AVAILABLE: "Encryption not available for this import type",
				TITLE: "Use Wallet Encryption",
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
			SUBTITLE: "Select the import method by which you want to import the address to your Profile.",
			TITLE: "Import Wallet",
			TYPE: "Import Type",
		},

		NETWORK_STEP: {
			SUBTITLE: "Select a cryptoasset to import your existing wallet address.",
			TITLE: "Select a Cryptoasset",
		},

		PASSPHRASE_CONFIRMATION_STEP: {
			SUBTITLE: "Confirm your password to continue",
			TITLE: "Confirm your passphrase",
		},

		SUCCESS_STEP: {
			SUBTITLE: "Wallet import is complete. Now you can use it.",
			TITLE: "Completed",
		},

		TITLE: "Import Wallet",

		VALIDATION: {
			DECRYPT_WIF_ASSERTION: "Failed to decrypt WIF. Please check your password.",
			INVALID_MNEMONIC: "The given value is not BIP39 compliant",
			INVALID_PRIVATE_KEY: "Invalid Private Key",
			INVALID_PUBLIC_KEY: "Invalid Public Key",
			INVALID_SECRET: "The given value is BIP39 compliant. Please change Import Type to 'Mnemonic'",
			INVALID_WIF: "Invalid WIF",
		},
	},

	PAGE_WALLET_DETAILS: {
		ADDITIONAL_OPTIONS: "Additional Options",
		COPY_ADDRESS: "Copy Address",
		COPY_PUBLIC_KEY: "Copy Public Key",
		OPTIONS: {
			DELETE: "Delete",
			MULTISIGNATURE: "Multisignature",
			RECEIVE_FUNDS: "Receive Funds",
			RECEIVE_FUNDS_QR: "QR",
			REGISTER_DELEGATE: "Delegate",
			RESIGN_DELEGATE: "Resign Delegate",
			SECOND_SIGNATURE: "Second Signature",
			SIGN_MESSAGE: "Sign Message",
			STORE_HASH: "Store Hash",
			TRANSACTION_HISTORY: "Transaction History",
			VERIFY_MESSAGE: "Verify Message",
			WALLET_NAME: "Wallet Name",
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
			DELEGATE_STATUS: "Delegate Status",
			EMPTY_DESCRIPTION: "You have not voted for a Delegate yet.",
			LOCKED_UNVOTES: "Locked Unvotes",
			LOCKED_VOTES: "Locked Votes",
			MULTIVOTE: "Multivote",
			NOT_FORGING_COUNT: "{{count}} of your delegates are currently not in a forging position",
			NOT_FORGING_one: "Your delegate is currently not in a forging position",
			NOT_FORGING_other: "Your delegates are currently not in a forging position",
			RESIGNED_COUNT: "Resigned {{count}}",
			RESIGNED_one: "Resigned",
			RESIGNED_other: "All Resigned",
			STANDBY_COUNT: "Standby {{count}}",
			STANDBY_one: "Standby",
			STANDBY_other: "All Standby",
			TITLE_one: "My Vote",
			TITLE_other: "My Votes",
			VOTING_FOR: "Voting for",
		},

		YOUR_WALLETS: "Your Wallets",
	},

	SIGNATURE: "Signature",

	STATUS: {
		ACTIVE: "Active",
		RESIGNED: "Resigned",
		STANDBY: "Standby",
	},

	UPDATE_WALLET_DATA: "Update Wallet Data",

	UPDATING_WALLET_DATA: "Updating Wallet Data",

	VALIDATION: {
		ALIAS_ASSIGNED: "The name '{{alias}}' is already assigned to another wallet",
	},

	WALLET_NAME: "Wallet Name",
};
