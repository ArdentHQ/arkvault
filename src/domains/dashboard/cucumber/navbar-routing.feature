Feature: Navbar Routing

	@routeToPortfolio
	Scenario: Route to Portfolio page via navbar
		Given Alice is signed into her profile
		When she selects portfolio in the navbar
		Then she is routed to the portfolio page

	@routeToExchange
	Scenario: Route to Exchange page via navbar
		Given Alice is signed into her profile
		When she selects exchange in the navbar
		Then she is routed to the exchange page

	@routeToTokens
	Scenario: Route to Tokens page via navbar
		Given Alice is signed into her profile
		When she selects tokens in the navbar
		Then she is routed to the tokens page
