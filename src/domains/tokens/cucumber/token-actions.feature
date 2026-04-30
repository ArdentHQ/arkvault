Feature: Token Actions

    @tokenAdd-validContract
    Scenario: Successfully add a token
		Given Alice signs into a profile
		And navigates to the tokens page
		And opens up add token side panel
		When she attempts to add a token with a valid contract address
        Then a success toast message is displayed

	@tokenAdd-invalidContract
	Scenario: Fail to add an invalid contract address
		Given Alice signs into a profile
		And navigates to the tokens page
		And opens up add token side panel
		When she attempts to add a token with a invalid contract address
		Then an error message is displayed

	@tokenDelete
	Scenario: Successfully delete added token
		Given Alice signs into a profile
		And navigates to the tokens page
		And opens up add token side panel
		When she attempts to add a token with a valid contract address
		Then a success toast message is displayed
		And switches to manage mode
		When she attempts to delete a token
		Then it should disappear from tokens table


