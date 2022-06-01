Feature: IPFS Transaction

    @ipfsTransaction
    Scenario: Successfully send IPFS transaction
        Given Alice is on the ipfs transaction form
        When she enters a valid ipfs hash
        And sends the ipfs transaction
        Then the transaction is sent successfully

    @ipfsTransaction-invalidHash
    Scenario: Fail to send IPFS transaction due to invalid hash
        Given Alice is on the ipfs transaction form
        When she enters an invalid ipfs hash
        Then an error is displayed on the ipfs hash field
        And the continue button is disabled

