Feature: Sign Message

    @signMessage
    Scenario: Successfully Sign Message
        Given Alice is on the wallet details page for imported wallet
        When she selects to sign message
        And submits the form with a valid mnemonic
        Then the message is successfully signed

    @signMessage-invalidMnemonic
    Scenario: Fail to sign message due to invalid mnemonic
        Given Alice is on the wallet details page for imported wallet
        When she selects to sign message
        And completes the form with an invalid mnemonic
        Then an error is displayed in the mnemonic field
        And the sign button is disabled

    @signMessage-openAndGoBack
    Scenario: Go to Sign Message page and back to Wallet Details page
        Given Alice is on the wallet details page for imported wallet
        When she selects to sign message
        But selects to go back from the sign message page
        Then the wallet details page is displayed
