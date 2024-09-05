export const translations = {
	DELEGATE_TABLE: {
		COMMISSION: "Comm.",
		COMMISSION_BY_PERIOD: "Commission ({{period}})",
		DELEGATES_NOT_FOUND: "Delegates not found",
		MIN: "Min.",
		NAME: "Delegate Name",
		PAYOUT_INTERVAL: "Payout",
		TITLE: "Select Delegate",
		TOOLTIP: {
			DELEGATE_IN_FORGING_POSITION: "Delegate in forging position",
			DELEGATE_IN_STANDY_POSITION: "Delegate in standby position",
			INVALID_AMOUNT: "Invalid amount specified for at least 1 amount field",
			MAX_VOTES: "You have selected the maximum number of delegates",
			SELECTED_DELEGATE: "You have not yet selected a delegate",
		},
		TOTAL: "Total",
		UNVOTES: "Unvotes",
		VOTE: "Vote",
		VOTES: "Votes",
		VOTE_AMOUNT: {
			AVAILABLE_TO_VOTE: "Available To Vote ({{percent}}%)",
			TITLE: "Vote Amount",
			TOOLTIP: "Number of {{ coinId }} you want to vote with for a specific delegate",
			VALIDATION: {
				AMOUNT_STEP: "Voting can only be done in multiples of {{step}} {{ coinId }}",
				MINIMUM_AMOUNT: "Minimum voting amount must be at least {{minimumAmount}} {{ coinId }}",
			},
		},
	},

	FILTERS: {
		ALL: "All",
		CURRENT_VOTES: "Current Votes",
	},

	VOTES_PAGE: {
		EMPTY_MESSAGE:
			"Your must first <bold>{{create}}</bold> or <bold>{{import}}</bold> an address to view your current voting status.",
		NO_RESULTS: "The Delegate is either unregistered or resigned. Check you search term and try again.",
		RESIGNED_VOTE: `"<bold>{{ name }}</bold>", the Delegate you are voting for has resigned. Press continue to unvote or select a new Delegate below.`,
		SEARCH_DELEGATE_PLACEHOLDER: "Enter the delegate’s name or address",
		SEARCH_WALLET_PLACEHOLDER: "Enter the wallet’s name or address",
		SELECT_CRYPTOASSET_MESSAGE: "Select one of the proposed cryptoassets above to vote for a delegate.",
		SUBTITLE: "Manage your cryptoasset staking.",
		TITLE: "My Votes",
	},
};
