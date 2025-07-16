Feature: Wallet Details

    @portfolioPage-loadMore
    Scenario: View more transactions via Load More button
		Given Alice is signed into a profile
        When she selects to view more transactions
        Then the transaction count is increased
