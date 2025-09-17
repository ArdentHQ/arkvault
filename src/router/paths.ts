export enum ProfilePaths {
	Welcome = "/",
	// Navigation Menu
	Dashboard = "/profiles/:profileId/dashboard",
	Exchange = "/profiles/:profileId/exchange",
	// Contacts
	Contacts = "/profiles/:profileId/contacts",
	// Messages
	SignMessage = "/profiles/:profileId/dashboard?method=sign",
	VerifyMessage = "/profiles/:profileId/verify-message",
	VerifyMessageWallet = "/profiles/:profileId/wallets/:walletId/verify-message",
	// Transactions
	SendTransfer = "/profiles/:profileId/dashboard?method=transfer",
	SendVote = "/profiles/:profileId/votes?method=vote",
	SendVoteWallet = "/profiles/:profileId/wallets/:walletId/votes?method=vote",
	SendMultiSignature = "/profiles/:profileId/wallets/:walletId/send-registration/multiSignature",
	SendValidatorRegistration = "/profiles/:profileId/wallets/:walletId/send-registration/validatorRegistration",
	SendUsernameRegistration = "/profiles/:profileId/wallets/:walletId/send-registration/usernameRegistration",
	SendUsernameResignation = "/profiles/:profileId/wallets/:walletId/send-username-resignation",
	SendUsernameResignationProfile = "/profiles/:profileId/send-username-resignation",
	// Exchange
	ExchangeView = "/profiles/:profileId/exchange/view",
	// Profile
	CreateProfile = "/profiles/create",
	ImportProfile = "/profiles/import",
	// Settings
	Settings = "/profiles/:profileId/settings",
	PasswordSettings = "/profiles/:profileId/settings/password",
	ExportSettings = "/profiles/:profileId/settings/export",
	GeneralSettings = "/profiles/:profileId/settings/general",
	ServerManagmentSettings = "/profiles/:profileId/settings/servers",
	// Votes
	Votes = "/profiles/:profileId/votes",
	VotesWallet = "/profiles/:profileId/wallets/:walletId/votes",
}
