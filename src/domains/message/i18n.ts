export const translations = {
	LEDGER_CONFIRMATION: {
		TITLE: "Confirm Your Signature",
	},

	PAGE_SIGN_MESSAGE: {
		AUTHENTICATION_STEP: {
			DESCRIPTION_ENCRYPTION_PASSWORD: "Enter your encryption password to sign the message.",
			DESCRIPTION_MNEMONIC: "Enter your mnemonic passphrase to sign the message.",
			DESCRIPTION_SECRET: "Enter your secret to sign the message.",
		},

		COPY_JSON: "Copy JSON",

		ERROR_STEP: {
			DESCRIPTION: "Something went wrong while signing the given message.",
			TITLE: "Signing Error",
		},

		FORM_STEP: {
			DESCRIPTION_ENCRYPTION_PASSWORD: "Provide a message below and sign with your encryption password.",
			DESCRIPTION_LEDGER: "Provide a message below and sign with your ledger.",
			DESCRIPTION_MNEMONIC: "Provide a message below and sign with your mnemonic passphrase.",
			DESCRIPTION_SECRET: "Provide a message below and sign with your secret.",
			DESCRIPTION_SELECT_WALLET: "Select an address and sign",
			JSON_STRING: "JSON String",
			SELECT_ADDRESS_DESCRIPTION: "Find and select the address from your wallets",
			SELECT_ADDRESS_TITLE: "Select Address",
			SIGNATURE_JSON: "Signature (JSON)",
			TITLE: "Sign Message",
		},

		SIGN: "Sign",

		SUCCESS_STEP: {
			TITLE: "Message Successfully Signed",
		},

		TITLE: "Sign Message",
	},

	PAGE_VERIFY_MESSAGE: {
		ERROR_STEP: {
			DESCRIPTION: "Something went wrong while verifying the given signature.",
			TITLE: "Verification Error",
		},

		FORM_STEP: {
			DESCRIPTION: "Authenticate a message from an address below.",
			JSON_PLACEHOLDER: '{"message": "...", "signatory": "...", "signature": "..."}',
			JSON_STRING: "JSON String",
			TITLE: "Verify Message",
			VERIFICATION_METHOD: {
				DESCRIPTION: "Input fields manually or provide a JSON string.",
				JSON: "JSON",
				MANUAL: "Manual",
				TITLE: "Verification Method",
			},
		},

		SUCCESS_STEP: {
			NOT_VERIFIED: {
				DESCRIPTION: "Message could not be verified.",
				TITLE: "Message Verification - Failed",
			},
			VERIFIED: {
				DESCRIPTION: "Message was successfully verified.",
				TITLE: "Message Verification - Success",
			},
		},

		TITLE: "Verify Message",

		VERIFY: "Verify",
	},
};
