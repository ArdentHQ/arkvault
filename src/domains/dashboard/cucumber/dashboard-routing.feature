Feature: Dashboard Routing

	@routeToDashboard
	Scenario: Route to dashboard after signing in
		Given Alice signs into her profile
		Then she is routed to the dashboard
