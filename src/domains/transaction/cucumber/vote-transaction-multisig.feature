Feature: Vote Transaction from Multisig Wallet

        @voteTransactionMultisig
        Scenario: Successfully send a vote transaction via multisig wallet
                Given Alice is on the Vote page for multisig wallet
                When she attempts to vote for a delegate with multisig wallet
                Then the transaction for multisig wallet is successfully created

