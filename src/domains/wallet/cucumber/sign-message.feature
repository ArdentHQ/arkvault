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

    @signMessage-openAndCancel
    Scenario: Open and cancel the Sign Message modal
        Given Alice is on the wallet details page for imported wallet
        When she selects to sign message
        But selects cancel on the sign message modal
        Then the modal is no longer displayed

    @signMessage-openAndClose
    Scenario: Open and close the Sign Message modal
        Given Alice is on the wallet details page for imported wallet
        When she selects to sign message
        But selects close on the sign message modal
        Then the modal is no longer displayed

