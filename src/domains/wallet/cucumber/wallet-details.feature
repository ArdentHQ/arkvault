Feature: Wallet Details

    @walletDetails-loadMore
    Scenario: View more transactions via Load More button
        Given Alice is on the wallet details page
        When she selects to view more transactions
        Then the transaction count is increased

    @walletDetails-star
    Scenario: Successfully star a wallet
        Given Alice is on the wallet details page
        When she selects the star icon
        Then the wallet is saved as starred
