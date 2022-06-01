Feature: Verify Message

    @verifyMessage
    Scenario: Successfully Verify Message
        Given Alice is on the wallet details page
        And selects to verify message
        When she enters valid details to verify a message
        And submits the verify message modal
        Then the message is successfully verified

    @verifyMessage-failVerification
    Scenario: Fail to Verify Message
        Given Alice is on the wallet details page
        And selects to verify message
        When she enters invalid details to verify a message
        And submits the verify message modal
        Then the message verification fails

    @verifyMessage-openAndClose
    Scenario: Open and close Verify Message modal
        Given Alice is on the wallet details page
        And selects to verify message
        When she closes the verify message modal
        Then the verify message modal is no longer displayed

    @verifyMessage-openAndCancel
    Scenario: Open and cancel Verify Message modal
        Given Alice is on the wallet details page
        And selects to verify message
        When she cancels the verify message modal
        Then the verify message modal is no longer displayed



