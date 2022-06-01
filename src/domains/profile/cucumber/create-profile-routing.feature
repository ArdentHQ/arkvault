Feature: Create Profile Routing

    @createProfileRouting
    Scenario: Navigate to Create Profile and back to Welcome Screen
        Given Alice is on the welcome screen
        When she selects create profile
        Then she is on the create profile page
        When she selects back
        Then she is back on the welcome page

