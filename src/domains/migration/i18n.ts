export const translations = {
	DISCLAIMER_MODAL: {
		// @TBD
		DISCLAIMER:
			"I agree with the rules and with something else <linkTerms>Terms of Service</linkTerms> & <linkPrivacyPolicy>Privacy Policy</linkPrivacyPolicy>",
		TITLE: "Migration Disclaimer",
		// @TBD
		WARNING:
			"Lorem ipsum dolor sit amet consectetur adipisicing elit. Nulla doloribus, mollitia natus est, voluptas eligendi nihil dolorum illum accusamus obcaecati itaque corrupti tenetur, accusantium perferendis officiis hic modi neque aspernatur!",
	},

	MIGRATION_ADD: {
		FROM_ARK_ADDRESS: "From ARK Address",

		STEP_AUTHENTICATION: {
			CONFIRM_TRANSACTION: "Confirm Your Migration Transaction",
			DESCRIPTION_ENCRYPTION_PASSWORD:
				"Enter your encryption password to authenticate the migration transaction.",
			DESCRIPTION_MNEMONIC: "Enter your mnemonic passphrase to authenticate the migration transaction.",
			DESCRIPTION_PRIVATE_KEY: "Enter your private key to authenticate the migration transaction.",
			DESCRIPTION_SECRET: "Enter your secret to authenticate the migration transaction.",
			DESCRIPTION_WIF: "Enter your WIF to authenticate the migration transaction.",
		},

		STEP_CONNECT: {
			DESCRIPTION: "Fill in address details below to start the migration process.",
			FORM: {
				AMOUNT_YOU_GET: "Amount You Get",
				AMOUNT_YOU_SEND: "Amount You Send",
				ARK_ADDRESS: "ARK Address",
				METAMASK: {
					CONNECT_WALLET: "Connect Wallet",
					DOWNLOAD_METAMASK: "Download MetaMask",
					INSTALL_METAMASK: "Install MetaMask",
					MESSAGES: {
						NEEDS_CONNECTED_WALLET:
							"To migrate, you need to have a Polygon network address and the <linkMetamask>MetaMask</linkMetamask> plugin.",
						NEEDS_METAMASK:
							"In order to complete the Migration, you must first install MetaMask. Learn more in our <linkMigrationGuide>Migration Guide</linkMigrationGuide>.",
						NEEDS_METAMASK_BROWSER:
							"In order to complete the Migration, you must first install the MetaMask mobile app or use a Web3-compatible browser. Learn more in our <linkMigrationGuide>Migration Guide</linkMigrationGuide>.",
						NEEDS_POLYGON:
							"Please select a Polygon address in MetaMask. Other networks are not supported. Learn more in our <linkMigrationGuide>Migration Guide</linkMigrationGuide>.",
					},
				},
				POLYGON_MIGRATION_ADDRESS: "Polygon Migration Address",
				SELECT_WALLET_TO_MIGRATE: "Select Wallet to Migrate",
				SELECT_WALLET_TO_MIGRATE_DESCRIPTION:
					"Select a wallet for which you want to migrate the balance to the new token.",
			},
			SWITCHING_NETWORK: "Switching …",
			SWITCH_TO_POLYGON: "Switch to Polygon",
			TITLE: "Migration",
		},

		STEP_PENDING: {
			DESCRIPTION: "Migration is processing, you will be notified once the process is complete.",
			MIGRATION_INFO:
				"Migration time <strong>≈ 24 hours</strong>.\nUpon completion you will receive a notification.",
			TITLE: "Migration Pending",
		},

		STEP_REVIEW: {
			AMOUNT_MIGRATED: "Amount Migrated",
			AMOUNT_SEND: "Amount You Send",
			DESCRIPTION: "Review the migration transaction details below.",
			TITLE: "Review Migration Transaction",
		},

		STEP_SUCCESS: {
			DESCRIPTION: "Your migration was successful.\nWelcome to Polygon!",
			TITLE: "Successfully Migrated",
		},

		TO_POLYGON_ADDRESS: "To Polygon Address",
	},
	NOTIFICATIONS: {
		MIGRATION_SUCCESSFUL: "Migration Successful",
	},
	PAGE_MIGRATION: {
		NEW_MIGRATION: "New Migration",
		NO_MIGRATIONS: "You don't have any migration transactions yet.",
		SUBTITLE: 'ARK is moving to Polygon. Click "New Migration" to get started.',
		TITLE: "Migrate to Polygon",
		VIEW_DETAILS: "View Details",
	},

	POLYGON_ADDRESS: "Polygon Address",

	STATUS: {
		CONFIRMED: "Confirmed",
		WAITING: "Waiting",
	},
	TRANSACTION_ID: "Transaction ID",
};
