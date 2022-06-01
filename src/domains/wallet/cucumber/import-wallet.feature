Feature: Import Wallet

    @importWallet-invalidMnemonic
    Scenario: Fail to Import Wallet due to invalid Mnemonic
        Given Alice is on the import wallet page
        When she enters an invalid mnemonic to import
        Then an error is displayed on the mnemonic field
        And the continue button is disabled

    @importWallet-invalidAddress
    Scenario: Fail to Import Wallet due to invalid Address
        Given Alice is on the import wallet page
        When she changes the import type to address
        And enters an invalid address to import
        Then an error is displayed on the address field
        And the continue button is disabled

    @importWallet-duplicateAddress
    Scenario: Fail to Import Wallet due to duplicate Address
        Given Alice is on the import wallet page
        And has imported a wallet
        When she attempts to import the same wallet again
        Then an error is displayed on the address field
        And the continue button is disabled

    @importWallet-mnemonic
    Scenario: Successfully Import Wallet via Mnemonic
        Given Alice is on the import wallet page
        When she enters a valid mnemonic to import
        And completes the import wallet steps for mnemonic
        Then the wallet is imported to her profile

    @importWallet-mnemonic-withEncryption
    Scenario: Successfully Import Wallet via Mnemonic with encryption
        Given Alice is on the import wallet page
        When she chooses to encrypt the imported wallet
        And enters a valid mnemonic to import
        And enters the encryption passwords
        And completes the import wallet steps for mnemonic
        Then the wallet is imported to her profile

    @importWallet-secret-withSecondSignatureAndEncryption
    Scenario: Successfully Import Wallet via Secret with second signature and encryption
        Given Alice is on the import wallet page
        When she changes the import type to secret
        And chooses to encrypt the imported wallet
        And enters a valid secret to import
        And enters the second secret
        And enters the encryption passwords
        And completes the import wallet steps for mnemonic
        Then the wallet is imported to her profile

    @importWallet-address
    Scenario: Successfully Import Wallet via Address
        Given Alice is on the import wallet page
        When she changes the import type to address
        And enters a valid address to import
        And completes the import wallet steps for address
        Then the wallet is imported to her profile
