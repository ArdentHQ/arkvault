Feature: Validator Resignation Transaction

    @validatorResignation
    Scenario: Successfully send validator resignation transaction
		Given Alice has navigated to the validator resignation form for a wallet
        When she completes the process with a valid mnemonic
        Then the transaction is sent successfully

    @validatorResignation-invalidMnemonic
    Scenario: Fail to send validator resignation due to invalid mnemonic
        Given Alice has navigated to the validator resignation form for a wallet
        When she attempts to complete the process with an invalid mnemonic
        Then an error is displayed on the mnemonic field
        And the send button is disabled
