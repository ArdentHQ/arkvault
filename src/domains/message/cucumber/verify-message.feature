Feature: Verify Message

    @verifyMessage
    Scenario: Successfully Verify Message
        Given Alice is on the wallet details page
        And selects to verify message
        When she enters valid details to verify a message
        And submits the form
        Then the message is successfully verified

    @verifyMessage-failVerification
    Scenario: Fail to Verify Message
        Given Alice is on the wallet details page
        And selects to verify message
        When she enters invalid details to verify a message
        And submits the form
        Then the message verification fails

    @verifyMessage-openAndGoBack
    Scenario: Go to Verify Message page and back to Wallet Details page
        Given Alice is on the wallet details page
        And selects to verify message
        But selects to go back
        Then the wallet details page is displayed
