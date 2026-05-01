Feature: Contract Deployment

    @contractDeployment
    Scenario: Successfully send contract deployment transaction
        Given Alice opens up contract deployment side panel
        When she enters a valid bytecode
        And sends the contract deployment transaction
        Then the transaction is sent successfully

	@contractDeployment-invalidMnemonic
	Scenario: Fail to send transaction due to invalid mnemonic
		Given Alice opens up contract deployment side panel
		When she fills the form with an invalid mnemonic
		Then an error is displayed on the mnemonic field
		And the send contract deployment button is disabled
