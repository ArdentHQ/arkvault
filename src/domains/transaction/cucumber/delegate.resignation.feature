Feature: Delegate Resignation Transaction

    @delegateResignation
    Scenario: Successfully send delegate resignation transaction
        Given Alice has navigated to the delegate resignation form for a wallet
        When she completes the process with a valid mnemonic
        Then the transaction is sent successfully

    @delegateResignation-invalidMnemonic
    Scenario: Fail to send delegate resignation due to invalid mnemonic
        Given Alice has navigated to the delegate resignation form for a wallet
        When she attempts to complete the process with an invalid mnemonic
        Then an error is displayed on the mnemonic field
        And the send button is disabled
