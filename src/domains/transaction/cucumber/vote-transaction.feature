Feature: Vote Transaction

    @voteTransaction
    Scenario: Successfully send a vote transaction
        Given Alice is on the Vote page
        When she attempts to vote for a delegate
        Then the transaction is successfully sent

    @voteTransaction-invalidMnemonic
    Scenario: Fail to vote due to invalid mnemonic
        Given Alice is on the Vote page
        When she attempts to vote for a delegate with an invalid mnemonic
        Then an error is displayed on the mnemonic field 
        And the send button is disabled. 