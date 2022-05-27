Feature: Create Profile

	@createProfile-noPassword
	Scenario: Creating a profile without password
		Given Alice is on the welcome screen
		And she clicks create
		When she fills out the form
		And she submits the form
		Then she will see the welcome screen

	@createProfile-withPassword
	Scenario: Creating a profile with password
		Given Alice is on the welcome screen
		And she clicks create
		When she fills out the form with a password
		And she submits the form
		Then she will see the welcome screen

	@createProfile-disabledSaveButton
	Scenario: Save button is disabled if the required fields are not completed
		Given Alice is on the welcome screen
		And she clicks create
		Then the create button should be disabled by default

	@createProfile-invalidPassword
	Scenario: Fail to create profile due to invalid password
		Given Alice is on the welcome screen
		And she clicks create
		When she fills out the form
		But enters an invalid password
		Then an error is displayed on the password field
		And the create button is disabled

	@createProfile-breachedPassword
	Scenario: Fail to create profile due to breached password
		Given Alice is on the welcome screen
		And she clicks create
		When she fills out the form
		But enters a breached password
		Then an error is displayed on the password field
		And the create button is disabled

	@createProfile-passwordConfirmFail
	Scenario: Fail to create profile due to password and confirmation password mismatch
		Given Alice is on the welcome screen
		And she clicks create
		When she fills out the form with a valid password
		But enters a different password in the confirm password field
		Then an error is displayed on the confirm password field
		And the create button is disabled

	@createProfile-invalidNameLength
	Scenario: Fail to create profile due to invalid name length
		Given Alice is on the welcome screen
		And she clicks create
		When she fills out the form excluding name
		But enters a profile name that exceeds 42 characters
		Then an error is displayed on the name field
		And the create button is disabled


