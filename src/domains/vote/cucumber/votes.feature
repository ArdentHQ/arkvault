Feature: Votes

    @votesNavigation
    Scenario: Navigate to Votes from Navbar
        Given Alice is signed into a profile
        When she select votes from navbar
        Then she is on the votes page

