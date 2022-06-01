Feature: Wallet

    @createWallet
    Scenario: Create new wallet
        Given Alice is signed into a profile
        When she navigates to create a wallet
        And selects a network
        And sees the generated mnemonic
        And confirms the generated mnemonic
        Then the new wallet is created

    @createWallet-withEncryption
    Scenario: Create new wallet with encryption
        Given Alice is signed into a profile
        When she navigates to create a wallet
        And selects a network
        And sees the generated mnemonic
        And chooses to encrypt the created wallet
        And confirms the generated mnemonic
        And enters the encryption passwords
        Then the new wallet is created

