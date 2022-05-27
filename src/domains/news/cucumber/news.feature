Feature: News Page

	@news-displayNews
	Scenario: Successfully display News Feed
	Given Alice is on the news page
	Then the news feed should be displayed
	
	@news-paginateNews
	Scenario: Use pagination on the news page
		Given Alice is on the news page
		When she uses pagination to view the next page of articles
		Then the next page of articles are displayed
		When she uses pagination to view the previous page of news
		Then the previous page of articles are displayed

	@news-filterNews
	Scenario: Filter the news results
		Given Alice is on the news page
		When she selects specific categories
		And searches for a specifc term
		Then the results should be filtered by category
		And the results should be filtered by the search term
		When she deselects a network
		Then the page should display that no results have been found
	
	@news-searchNoResults
	Scenario: Display no results page from search
		Given Alice is on the news page
		When she searches for a term that finds 0 results
		Then the page should display that no results have been found

