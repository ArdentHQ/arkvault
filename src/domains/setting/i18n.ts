export const translations = {
	APPEARANCE: {
		MENU_ITEM: "Appearance",
		OPTIONS: {
			ACCENT_COLOR: {
				COLORS: {
					GREEN: "Green",
					NAVY: "Navy",
				},
				DESCRIPTION: "Choose a color for buttons and other wallet features.",
				TITLE: "Accent Color",
			},
			LATEST_TRANSACTIONS: {
				DESCRIPTION: "Enables latest transactions on Portfolio page.",
				TITLE: "Portfolio Latest Transactions",
			},
			VIEWING_MODE: {
				DESCRIPTION: "Choose a light or dark viewing mode.",
				TITLE: "Viewing Mode",
				VIEWING_MODES: {
					DARK: "Dark",
					LIGHT: "Light",
				},
			},
			WALLET_NAMING: {
				DESCRIPTION: "Prioritize showing network provided names over wallet names.",
				TITLE: "Wallet Naming",
			},
		},
		SUBTITLE: "Customize the look of the application.",
		TITLE: "Appearance",
	},
	EXPORT: {
		ADD_INFORMATION_ABOUT_THE_NETWORK: "Add information about the network",
		MENU_ITEM: "Export",
		OPTIONS: {
			EXCLUDE_EMPTY_WALLETS: {
				DESCRIPTION: "Wallets with a balance of 0 will not be exported.",
				TITLE: "Exclude Empty Wallets",
			},
			EXCLUDE_LEDGER_WALLETS: {
				DESCRIPTION: "Ledger hardware addresses will not be exported.",
				TITLE: "Exclude Ledger Wallets",
			},
		},
		SAVE_GENERAL_CUSTOMIZATIONS: "Save general settings customizations",
		SUBTITLE:
			"Your exported Profile will not contain your mnemonic passphrases, only addresses and respective names.",
		SUCCESS: "Your settings have been exported successfully",
		TITLE: "Export Profile",
	},

	GENERAL: {
		ERROR: "Your profile settings could not be updated",
		MENU_ITEM: "General",
		OTHER: {
			DARK_THEME: {
				DESCRIPTION: "Enables a dark, high contrast scheme.",
				TITLE: "Dark Theme",
			},
			DEVELOPMENT_NETWORKS: {
				DESCRIPTION:
					"To create or import wallets from development and test networks, you must first enable this feature.",
				TITLE: "Development and Test Networks",
			},
			RESET_SETTINGS: {
				DESCRIPTION: "Restore Profile settings to the default.",
				TITLE: "Reset Settings",
			},
			TITLE: "Other",
		},
		PERSONAL: {
			CONFIRM_PASSWORD: "Confirm Password",
			CURRENCY: "Currency",
			LANGUAGE: "Language",
			MARKET_PROVIDER: "Market Data Provider",
			NAME: "Profile Name",
			PASSPHRASE_LANGUAGE: "Passphrase Language",
			PASSWORD: "Password",
			PROFILE_IMAGE: "Profile Image",
			REMOVE_AVATAR: "Remove Avatar",
			TIME_FORMAT: "Time Format",
			TITLE: "Personal Details",
			UPLOAD_AVATAR: "Upload Avatar",
			VALIDATION: {
				NAME_EXISTS: "Profile name already exists",
			},
		},
		SECURITY: {
			ADVANCED_MODE: {
				DESCRIPTION: "Allows installations from direct URLs. Enable at your own risk.",
				TITLE: "Advanced Mode",
			},
			AUTOMATIC_SIGN_OUT_PERIOD: {
				TITLE: "Auto Log-Off",
			},
			TITLE: "Security",
		},
		SUBTITLE: "Customize your wallet to suit your needs.",
		SUCCESS: "Your profile settings have been updated",
		TITLE: "Profile Settings",
		UNSUPPORTED_CURRENCY: "{{currency}} is not supported by {{provider}}. Currency has been changed to USD.",
	},

	MODAL_DEVELOPMENT_NETWORK: {
		DESCRIPTION:
			"Disabling this setting will hide your wallets associated with development networks. Are you sure you want to continue?",
		TITLE: "Development Network",
	},

	NETWORKS: {
		ADD_NEW_NETWORK: {
			DESCRIPTION: "Add a custom network by providing a valid seed address.",
			TITLE: "Add Network",
		},
		CUSTOM_NETWORKS: {
			ADD_NETWORK: "Add Network",
		},
		DELETE_MODAL: {
			DESCRIPTION:
				"This action cannot be undone and will result in  removal of all wallets and contact addresses that  were added for this network. To confirm this action, enter the network name below.",
			TITLE: "Remove Network",
		},
		DETAILS_MODAL: {
			DESCRIPTION: "Overview of the data obtained from the network.",
			TITLE: "Network Information",
		},
		FORM: {
			DELETE_CONFIRM_PLACEHOLDER: "Enter the network name to confirm removal",
			EXPLORER: "Explorer",
			FETCHING_ERROR: "Cannot obtain network data. Check Seed Server.",
			INVALID_KNOWN_WALLETS_URL: "Invalid Known Wallets URL",
			INVALID_MARKET_TICKER_FORMAT: "Incorrect market ticker format",
			INVALID_SEED_SERVER_FORMAT: "Invalid seed server format",
			INVALID_SLIP_FORMAT: "Invalid SLIP (BIP44) format",
			KNOWN_WALLETS: "Known Wallets URL",
			MARKET_TICKER: "Market Ticker",
			NETWORK_HASH_MISMATCH:
				"Seed server you are trying to add is not part of this network. Add new custom network or provide correct seed server for current network.",
			NETWORK_NAME: "Network Name",
			SEED_SERVER: "Seed Server",
			SEED_SERVER_PLACEHOLDER: "https://ip:port or https://domain",
			SLIP: "SLIP (BIP44)",
		},
		MENU_ITEM: "Networks",
		MESSAGES: {
			AT_LEAST_ONE_DEFAULT_NETWORK: "At least 1 default network required.",
			CUSTOM_NETWORK_ADDED: "Custom network <strong>{{- networkName}}</strong> was successfully added.",
			CUSTOM_NETWORK_DELETED:
				"<strong>{{- networkName}}</strong> has been successfully deleted from your profile.",
		},
		OPTIONS: {
			CUSTOM_NETWORKS: {
				DESCRIPTION: "Add and manage Custom Networks for your Profile.",
				TITLE: "Custom Networks",
			},
			DEFAULT_NETWORKS: {
				DESCRIPTION: "Manage the default networks that are active for your Profile",
				TITLE: "Default Networks",
			},
		},
		SUBTITLE: "Customize and manage networks. Enabled and selected networks will be visible in your Profile.",
		TITLE: "Manage Networks",
		UPDATE_NETWORK: {
			DESCRIPTION: "Modify settings of the selected network.",
			TITLE: "Edit Network",
		},
	},

	PASSWORD: {
		BUTTON: {
			CHANGE: "Change Password",
			CREATE: "Set Password",
			REMOVE: "Remove Password",
		},
		CURRENT: "Current Password",
		ERROR: {
			FALLBACK: "Something went wrong.",
			MISMATCH: "The current password does not match.",
		},
		MENU_ITEM: "Password",
		PASSWORD_1: "New Password",
		PASSWORD_2: "Confirm New Password",
		REMOVAL: {
			DESCRIPTION:
				"Removing your profile password will result in anyone with access to your device to see all your profile data. Are you sure you wish to remove it?",
			PROFILE_PASSWORD: "Profile Password",
			SUCCESS: "Password successfully removed.",
			TITLE: "Remove Profile Password",
		},
		SUBTITLE: {
			CHANGE: "Change the password used to secure your Profile below.",
			CREATE: "Set your password below to secure your Profile.",
		},
		SUCCESS: "Your password has been successfully changed.",
		TITLE: "Profile Password",
	},

	SERVERS: {
		ADD_NEW_SERVER: {
			DESCRIPTION:
				"Add a custom network peer or multisignature server for the selected network by providing a valid address.",
			FETCHING_DETAILS: "Fetching details ...",
			FETCHING_ERROR:
				"We were unable to connect to the provided server or failed to find the expected information. Please check your input and try again.",
			MULTISIG_SERVER: "Multisig Server",
			NETWORK_MISMATCH_ERROR: "Failed to connect to host because it is on another network",
			NETWORK_PLACEHOLDER: "https://ip:port/api or https://domain",
			PEER_SERVER: "Network Peer",
			SUCCESS_MESSAGE:
				"New {{networkType}} <strong>{{serverName}}</strong> for <strong>{{networkName}}</strong> has been successfully added.",
			TITLE: "Add New Server",
		},
		CUSTOM_PEERS: {
			EMPTY_MESSAGE: "No custom network peers or multisignature servers added yet.",
		},
		DELETE_MODAL: {
			DESCRIPTION:
				"By removing <strong>{{serverName}}</strong> your interactions with <strong>{{networkName}}</strong> might become unavailable if other servers are unreachable. Are you sure you wish to remove it?",
			TITLE: "Remove Server",
		},
		EDIT_SERVER: {
			DESCRIPTION: "Edit information for custom added server.",
			SUCCESS_MESSAGE: "Server data for <strong>{{serverName}}</strong> has been successfully updated.",
			TITLE: "Edit Server",
		},
		MENU_ITEM: "Servers",
		NODE_STATUS_TOOLTIPS: {
			HEALTHY: "Default nodes are healthy.",
			WITH_ISSUES: "Default nodes are experiencing issues, please check on socials for more information.",
		},
		OPTIONS: {
			CUSTOM_PEERS: {
				DESCRIPTION:
					"Manage custom peers and multisig servers. Using more than one per network will broadcast to all selected.",
				TITLE: "Custom Peers and Multisig Servers",
			},
			DEFAULT_NODE_STATUS: {
				DESCRIPTION: "Check health of default nodes for each enabled network.",
				TITLE: "Default Nodes Status",
			},
			FALLBACK_TO_DEFAULT_NODES: {
				DESCRIPTION:
					"Only used when custom servers are selected. In case of issues, the wallet will fallback to using the default nodes to broadcast transactions.",
				TITLE: "Fallback to Default Nodes",
			},
		},
		PEERS_STATUS_TOOLTIPS: {
			HEALTHY: "Peer is healthy",
			WITH_ISSUES: "Peer is not resolving",
		},
		SUBTITLE: "Manage custom network peers and multisignature servers for your Profile.",
		SUCCESS: "Your server settings has been successfully updated.",
		TITLE: "Peers & Multisig Servers",
	},

	TITLE: "Settings",
};
