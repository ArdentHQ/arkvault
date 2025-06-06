export const translations = {
	APPEARANCE: {
		MENU_ITEM: "Appearance",
		OPTIONS: {
			ADDRESS_NAMING: {
				DESCRIPTION: "Prioritize showing network provided names over wallet names.",
				TITLE: "Address Naming",
			},
			VIEWING_MODE: {
				DESCRIPTION: "Choose a light / dark / dim viewing mode.",
				TITLE: "Viewing Mode",
				VIEWING_MODES: {
					DARK: "Dark",
					DIM: "Dim",
					LIGHT: "Light",
				},
			},
		},
		SUBTITLE: "Customize the look of the application.",
		TITLE: "Appearance",
	},
	EXPORT: {
		ADD_INFORMATION_ABOUT_THE_NETWORK: "Add information about the network",
		DESCRIPTION:
			"Your exported Profile will not contain your mnemonic passphrases, only addresses and respective names.",
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
		SUCCESS: "Your settings have been exported successfully.",
		TITLE: "Export Profile",
	},

	GENERAL: {
		APPEARANCE: {
			TITLE: "Appearance",
		},
		ERROR: "Your profile settings could not be updated.",
		MENU_ITEM: "General",
		OTHER: {
			ADDRESS_NAMING: {
				DESCRIPTION: "Prioritize showing network provided names over wallet names.",
				TITLE: "Address Naming",
			},
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
			SHOW_DEVELOPMENT_NETWORK: {
				DESCRIPTION: "Display an option to switch to the development network in the navigation menu.",
				TITLE: "Show Development Network",
			},
			TITLE: "Other",
			VIEWING_MODE: {
				DESCRIPTION: "Choose a light / dark / dim viewing mode.",
				TITLE: "Viewing Mode",
				VIEWING_MODES: {
					DARK: "Dark",
					DIM: "Dim",
					LIGHT: "Light",
				},
			},
		},
		PERSONAL: {
			CONFIRM_PASSWORD: "Confirm Password",
			CURRENCY: "Currency",
			LANGUAGE: "Language",
			MARKET_PROVIDER: "Market Data Provider",
			NAME: "Profile Name",
			PASSPHRASE_LANGUAGE: "Passphrase Language",
			PASSWORD: "Password",
			PRICE_SOURCE: "Price Source",
			PROFILE_IMAGE: "Select Profile Image",
			REMOVE_AVATAR: "Remove Avatar",
			TIME_FORMAT: "Time Format",
			TITLE: "Personal Details",
			UPLOAD_AVATAR: "Upload Avatar",
			VALIDATION: {
				NAME_EXISTS: "Profile name already exists.",
			},
		},
		SECURITY: {
			AUTOMATIC_SIGN_OUT_PERIOD: {
				TITLE: "Auto Log-Off",
			},
			TITLE: "Security",
		},
		SUBTITLE: "Customize your wallet to suit your needs.",
		SUCCESS: "Your profile settings have been updated.",
		TITLE: "Settings",
		UNSUPPORTED_CURRENCY: "{{currency}} is not supported by {{provider}}. Currency has been changed to USD.",
	},

	MODAL_DEVELOPMENT_NETWORK: {
		DESCRIPTION:
			"Disabling this setting will hide your wallets associated with development networks. Are you sure you want to continue?",
		TITLE: "Development Network",
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
		REMOVE_PASSWORD: {
			DESCRIPTION: "Sign in to your profile without a password.",
			TITLE: "Remove Password",
			TOOLTIP: "Password isn't set.",
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
			DESCRIPTION: "To add a custom peer, enter valid endpoints for the selected network.",
			ENDPOINT_ERROR: "Either failed to connect to the endpoint or it doesn't contain the expected information.",
			EVM_API_ENDPOINT: "EVM API Endpoint",
			FETCHING_DETAILS: "Fetching details ...",
			FETCHING_ERROR:
				"We were unable to connect to the provided endpoint(s) or failed to find the expected information. Please check your input and try again.",
			MULTISIG_SERVER: "Multisig Server",
			NETWORK_MISMATCH_ERROR: "Either failed to connect to the endpoint or it is on another network.",
			NETWORK_PLACEHOLDER: "https://ip:port/api or https://domain",
			PEER_SERVER: "Network Peer",
			PUBLIC_API_ENDPOINT: "Public API Endpoint",
			SUCCESS_MESSAGE:
				"New {{networkType}} <strong>{{serverName}}</strong> for <strong>{{networkName}}</strong> has been successfully added.",
			TITLE: "Add New Server",
			TRANSACTION_API_ENDPOINT: "Transaction API Endpoint",
		},
		API: "API",
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
		EVM: "EVM",
		MENU_ITEM: "Servers",
		NODE_STATUS_TOOLTIPS: {
			EVM_API: "EVM API",
			HEALTHY: "Default nodes are healthy.",
			PUBLIC_API: "Public API",
			TX_API: "Tx API",
			WITH_ISSUES: "Default nodes are experiencing issues, please check on socials for more information.",
			WITH_ISSUES_1: "The {{host0}} is experiencing issues, please check on socials for more information.",
			WITH_ISSUES_2:
				"The {{host0}} and {{host1}} are experiencing issues, \nplease check on socials for more information.",
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
			HEALTHY: "Peer is healthy.",
			RESPONSIVE: "Responsive",
			UNRESPONSIVE: "Unresponsive",
			WITH_ISSUES: "Peer is not resolving.",
		},
		SUBTITLE: "Manage custom network peers and multisignature servers for your Profile.",
		SUCCESS: "Your server settings have been successfully updated.",
		TITLE: "Peers & Multisig Servers",
		TX: "Tx",
	},

	TITLE: "Settings",
};
