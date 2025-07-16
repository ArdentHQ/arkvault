Feature: Validator Registration Transaction

    @validatorRegistration
    Scenario: Successfully send validator registration transaction
        Given Alice has navigated to the validator registration form for a wallet
        When she enters valid public key
        And sends the validator registration transaction
        Then the transaction is sent successfully

	@validatorRegistration-invalidName
    Scenario: Fail to register validator due to invalid public key
        Given Alice has navigated to the validator registration form for a wallet
        When she enters an invalid public key
        Then an error is displayed on the name field
        And the continue button is disabled

    @validatorRegistration-usedPublicKey
    Scenario: Fail to register validator due to used public key length
        Given Alice has navigated to the validator registration form for a wallet
        When she enters a public key that already used
        Then an error is displayed on the name field
        And the continue button is disabled





