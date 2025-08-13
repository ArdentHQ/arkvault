export const translations = {
	FILTERS: {
		ALL: "All",
		CURRENT_VOTES: "Current Votes",
		NO_VOTES: "You have not yet voted for validators",
	},

	VALIDATOR_TABLE: {
		COMMISSION: "Comm.",
		COMMISSION_BY_PERIOD: "Commission ({{period}})",
		MIN: "Min.",
		NAME: "Validator",
		PAYOUT_INTERVAL: "Payout",
		TITLE: "Select Validator",
		TOOLTIP: {
			INVALID_AMOUNT: "Invalid amount specified for at least 1 amount field.",
			MAX_VOTES: "You have selected the maximum number of validators.",
			SELECTED_VALIDATOR: "You have not yet selected a validator.",
			VALIDATOR_IN_FORGING_POSITION: "Validator in forging position.",
			VALIDATOR_IN_STANDY_POSITION: "Validator in standby position.",
		},
		TOTAL: "Total",
		UNVOTES: "Unvotes",
		VALIDATORS_NOT_FOUND: "Validators not found.",
		VOTE: "Vote",
		VOTES: "Votes",
		VOTE_AMOUNT: {
			AVAILABLE_TO_VOTE: "Available To Vote ({{percent}}%)",
			TITLE: "Vote Amount",
			TOOLTIP: "Number of {{ coinId }} you want to vote with for a specific validator.",
			VALIDATION: {
				AMOUNT_STEP: "Voting can only be done in multiples of {{step}} {{ coinId }}.",
				MINIMUM_AMOUNT: "Minimum voting amount must be at least {{minimumAmount}} {{ coinId }}.",
			},
		},
		VOTING_ADDRESS: "Voting Address",
	},

	VOTES_PAGE: {
		EMPTY_MESSAGE:
			"Your must first <bold>{{create}}</bold> or <bold>{{import}}</bold> an address to view your current voting status.",
		NO_BALANCE: "Voting disabled due to insufficient balance.",
		NO_RESULTS: "The Validator is either unregistered or resigned. Check your search term and try again.",
		RESIGNED_VOTE: `"<bold>{{ name }}</bold>", the Validator you are voting for has resigned. Press continue to unvote or select a new Validator below.`,
		SEARCH_VALIDATOR_PLACEHOLDER: "Enter the validator’s name or address",
		SEARCH_WALLET_PLACEHOLDER: "Enter the wallet’s name or address",
		SELECT_CRYPTOASSET_MESSAGE: "Select one of the proposed cryptoassets above to vote for a validator.",
		SUBTITLE: "Manage your cryptoasset staking.",
		TITLE: "Votes",
	},
};
