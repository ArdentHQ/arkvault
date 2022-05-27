Feature: Delete Profile

    @deleteProfile-noPassword
    Scenario: Successfully delete a profile
        Given Alice is on the welcome screen
        When she attempts to delete a profile that isn't password protected
        And confirms the deletion
        Then the profile is removed

