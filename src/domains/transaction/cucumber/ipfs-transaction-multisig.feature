Feature: IPFS Transactions from multisig address

    @ipfsTransaction-multisig
    Scenario: Successfully send IPFS transaction from multisig
        Given Alice is on the ipfs transaction form with a multisig wallet
        When she enters a valid ipfs hash
        And sends the ipfs transaction with multisig wallet
        Then the transaction is created successfully

