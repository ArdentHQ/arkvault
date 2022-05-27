Feature: Navbar Routing

	@routeToPortolio
	Scenario: Route to Portfolio page via navbar
		Given Alice is signed into her profile
		When she selects portfolio in the navbar
		Then she is routed to the portfolio page

	@routeToExchange
	Scenario: Route to Exchange page via navbar
		Given Alice is signed into her profile
		When she selects exchange in the navbar
		Then she is routed to the exchange page

	@routeToNews
	Scenario: Route to News page via navbar
		Given Alice is signed into her profile
		When she selects news in the navbar
		Then she is routed to the news page

	@routeToSend
	Scenario: Route to Send page via navbar
		Given Alice is signed into her profile
		When she selects send in the navbar
		Then she is routed to the send page
