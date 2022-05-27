Feature: Wallet Routing

    @walletRouting-walletDetails
    Scenario: Successfully navigate to Wallet Details
        Given Alice is signed into a profile
        When she selects a network
		And she selects a wallet
        Then she is navigated to the wallet details page

    @walletRouting-createWallet
    Scenario: Successfully navigate to Create Wallet
        Given Alice is signed into a profile
        When she selects create wallet
        Then she is navigated to the create wallet page

    @walletRouting-importWallet
    Scenario: Successfully navigate to Import Wallet
        Given Alice is signed into a profile
        When she selects import wallet
        Then she is navigated to the import wallet page


