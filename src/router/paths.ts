export enum ProfilePaths {
	Welcome = "/",
	// Navigation Menu
	Dashboard = "/profiles/:profileId/dashboard",
	Exchange = "/profiles/:profileId/exchange",
	// Contacts
	Contacts = "/profiles/:profileId/contacts",
	// Wallet
	WalletDetails = "/profiles/:profileId/wallets/:walletId",
	CreateWallet = "/profiles/:profileId/wallets/create",
	ImportWallet = "/profiles/:profileId/wallets/import",
	ImportWalletLedger = "/profiles/:profileId/wallets/import/ledger",
	WalletGroupPage = "/profiles/:profileId/network/:networkId",
	// Messages
	SignMessage = "/profiles/:profileId/sign-message",
	SignMessageWallet = "/profiles/:profileId/wallets/:walletId/sign-message",
	VerifyMessage = "/profiles/:profileId/verify-message",
	VerifyMessageWallet = "/profiles/:profileId/wallets/:walletId/verify-message",
	// Transactions
	SendRegistration = "/profiles/:profileId/wallets/:walletId/send-registration/:registrationType",
	SendDelegateResignation = "/profiles/:profileId/wallets/:walletId/send-validator-resignation",
	SendTransferWallet = "/profiles/:profileId/wallets/:walletId/send-transfer",
	SendTransfer = "/profiles/:profileId/send-transfer",
	SendVote = "/profiles/:profileId/send-vote",
	SendVoteWallet = "/profiles/:profileId/wallets/:walletId/send-vote",
	SendMultiSignature = "/profiles/:profileId/wallets/:walletId/send-registration/multiSignature",
	SendDelegateRegistration = "/profiles/:profileId/wallets/:walletId/send-registration/delegateRegistration",
	// Exchange
	ExchangeView = "/profiles/:profileId/exchange/view",
	// Profile
	CreateProfile = "/profiles/create",
	ImportProfile = "/profiles/import",
	// Settings
	Settings = "/profiles/:profileId/settings",
	PasswordSettings = "/profiles/:profileId/settings/password",
	ExportSettings = "/profiles/:profileId/settings/export",
	AppearanceSettings = "/profiles/:profileId/settings/appearance",
	GeneralSettings = "/profiles/:profileId/settings/general",
	ServerManagmentSettings = "/profiles/:profileId/settings/servers",
	NetworkManagmentSettings = "/profiles/:profileId/settings/networks",
	// Votes
	Votes = "/profiles/:profileId/votes",
	VotesWallet = "/profiles/:profileId/wallets/:walletId/votes",
}
