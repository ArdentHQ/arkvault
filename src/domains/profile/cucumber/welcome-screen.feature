Feature: Welcome Screen

    @welcomeScreen
    Scenario: Load the Welcome Page
        Given Alice goes to the welcome page
        Then the welcome screen is displayed

	# @TODO: enable after vite
    # @welcomeScreen-returnWhenIdle
    # Scenario: Return to Welcome Page due to inactivity
    #     Given Alice is on the Settings page
    #     And has set the auto logout to 1 minute
    #     Then after 1 minute of being idle she is returned to the welcome page
