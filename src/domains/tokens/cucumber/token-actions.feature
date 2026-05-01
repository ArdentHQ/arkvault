Feature: Token Actions

    @addValidContract
    Scenario: Successfully add a token
		Given Alice signs into a profile
		And navigates to the tokens page
		And opens up add token side panel
		When she attempts to add a token with a valid contract address
        Then a success toast message is displayed

	@addInvalidContract
	Scenario: Fail to add a token with an invalid contract address
		Given Alice signs into a profile
		And navigates to the tokens page
		And opens up add token side panel
		When she attempts to add a token with a invalid contract address
		Then an error message is displayed

	@deleteToken
	Scenario: Successfully delete added token
		Given Alice signs into a profile
		And navigates to the tokens page
		And opens up add token side panel
		When she attempts to add a token with a valid contract address
		Then a success toast message is displayed
		And switches to manage mode
		When she attempts to delete a token
		Then it should disappear from tokens table

	@enableHideDust
	Scenario: Enable Hide Dust flag and hide tokens with balance less than 0.01
		Given Alice signs into a profile
		And navigates to the tokens page
		When she enables Hide Dust
		Then tokens list should refresh


