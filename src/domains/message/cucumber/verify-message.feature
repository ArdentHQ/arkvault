Feature: Verify Message

    @verifyMessage
    Scenario: Successfully Verify Message
        Given Alice is on the portfolio page
        And selects to verify message
        When she enters valid details to verify a message
        And submits the form
        Then the message is successfully verified

    @verifyMessage-failVerification
    Scenario: Fail to Verify Message
        Given Alice is on the portfolio page
        And selects to verify message
        When she enters invalid details to verify a message
        And submits the form
        Then the message verification fails

    @verifyMessage-openAndGoBack
    Scenario: Open up Verify Message side panel and back to Portfolio page
        Given Alice is on the portfolio page
        And selects to verify message
        But selects to go back from the verify message side panel
        Then the portfolio page is displayed
