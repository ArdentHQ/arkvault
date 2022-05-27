Feature: Single Transfer

    @singleTransfer
    Scenario: Successfully send a single transfer
        Given Alice is on the transaction form
        When she completes the single transfer process with a valid mnemonic
        Then the transaction is successfully sent

    @singleTransfer-invalidMnemonic
    Scenario: Fail to send transaction due to invalid mnemonic
        Given Alice is on the transaction form
        When she completes the single transfer process with an invalid mnemonic
        Then an error is displayed on the mnemonic field
        And the send button is disabled
