import { Selector } from "testcafe";

import { buildTranslations } from "../../../app/i18n/helpers";
import { cucumber, mockRequest, visitWelcomeScreen } from "../../../utils/e2e-utils";
import { goToNews } from "../e2e/common";

const itemsPerPage = 15;
const translations = buildTranslations();
const searchBarButton = Selector('[data-testid="HeaderSearchBar"] button');
const queryInput = Selector('[data-testid="HeaderSearchBar__input"] input');
const newsCard = Selector('[data-testid="NewsCard"]');

const filteredNews = "news/filtered";

const preSteps = {
	"Given Alice is on the news page": async (t: TestController) => {
		await visitWelcomeScreen(t);
		await goToNews(t);
	},
};
cucumber(
	"@news-displayNews",
	{
		...preSteps,
		"Then the news feed should be displayed": async (t: TestController) => {
			await t.expect(newsCard.exists).ok();
			await t.expect(newsCard.count).eql(itemsPerPage);
		},
	},
	[mockRequest("https://news.payvo.com/api?coins=ARK&page=1", "news/page-1")],
);

cucumber(
	"@news-paginateNews",
	{
		...preSteps,
		"When she uses pagination to view the next page of articles": async (t: TestController) => {
			await t.hover(Selector('[data-testid="Pagination__next"]'));
			await t.click(Selector('[data-testid="Pagination__next"]'));
		},
		"Then the next page of articles are displayed": async (t: TestController) => {
			await t.expect(newsCard.exists).ok();
			await t.expect(newsCard.count).eql(itemsPerPage);
		},
		"When she uses pagination to view the previous page of news": async (t: TestController) => {
			await t.hover(Selector('[data-testid="Pagination__previous"]'));
			await t.click(Selector('[data-testid="Pagination__previous"]'));
		},
		"Then the previous page of articles are displayed": async (t: TestController) => {
			await t.expect(newsCard.exists).ok();
			await t.expect(newsCard.count).eql(itemsPerPage);
		},
	},
	[
		mockRequest("https://news.payvo.com/api?coins=ARK&page=1", "news/page-1"),
		mockRequest("https://news.payvo.com/api?coins=ARK&page=2", "news/page-2"),
	],
);
cucumber(
	"@news-filterNews",
	{
		...preSteps,
		"When she selects specific categories": async (t: TestController) => {
			for (const category of ["Marketing", "Community", "Emergency"]) {
				await t.click(Selector(`[data-testid="NewsOptions__category-${category}"]`));
			}
		},
		"And searches for a specifc term": async (t: TestController) => {
			await t.click(searchBarButton);
			const query = "major league hacking";
			await t.typeText(queryInput, query, { replace: true });
		},
		"Then the results should be filtered by category": async (t: TestController) => {
			await t.expect(newsCard.exists).ok();
			await t
				.expect(
					Selector('[data-testid="NewsCard__category"]').withText(translations.NEWS.CATEGORIES.TECHNICAL)
						.exists,
				)
				.ok();
		},
		"And the results should be filtered by the search term": async (t: TestController) => {
			await t.expect(Selector('[data-testid="NewsCard__content"]').withText(/major league hacking/i).exists).ok();
		},
		"When she deselects a network": async (t: TestController) => {
			const ark = "NetworkOption__ark.mainnet";
			await t.click(Selector(`[data-testid="${ark}"]`));
		},
		"Then the page should display that no results have been found": async (t: TestController) => {
			await t.expect(Selector('[data-testid="EmptyResults"]').exists).ok();
		},
	},
	[
		mockRequest("https://news.payvo.com/api?coins=ARK&page=1", "news/page-1"),
		mockRequest("https://news.payvo.com/api?coins=ARK&page=2", "news/page-2"),
		mockRequest(
			"https://news.payvo.com/api?coins=ARK%2CETH&page=1&categories=Technical&query=major+league+hacking",
			filteredNews,
		),
		mockRequest(
			"https://news.payvo.com/api?coins=ARK&page=1&categories=Technical%2CCommunity%2CEmergency",
			filteredNews,
		),
		mockRequest(
			"https://news.payvo.com/api?coins=ARK&page=1&categories=Community%2CEmergency%2CTechnical",
			filteredNews,
		),
		mockRequest("https://news.payvo.com/api?coins=ARK&page=1&categories=Emergency%2CTechnical", filteredNews),
		mockRequest("https://news.payvo.com/api?coins=ARK&page=1&categories=Technical%2CEmergency", filteredNews),
		mockRequest("https://news.payvo.com/api?coins=ARK&page=1&categories=Technical", filteredNews),
		mockRequest(
			"https://news.payvo.com/api?coins=ARK&page=1&categories=Technical&query=major+league+hacking",
			filteredNews,
		),
		mockRequest("https://news.payvo.com/api?coins=ARK%2CETH&page=1&categories=Technical", filteredNews),
		mockRequest(
			"https://news.payvo.com/api?coins=ARK&page=1&categories=Technical%2CCommunity%2CEmergency&query=major+league+hacking",
			filteredNews,
		),
		mockRequest(
			"https://news.payvo.com/api?coins=ARK&page=1&categories=Technical%2CEmergency&query=major+league+hacking",
			filteredNews,
		),
		mockRequest(
			"https://news.payvo.com/api?coins=ARK&page=1&categories=Technical&query=major+league+hackin",
			filteredNews,
		),
	],
);
cucumber(
	"@news-searchNoResults",
	{
		...preSteps,
		"When she searches for a term that finds 0 results": async (t: TestController) => {
			await t.click(searchBarButton);
			const query = "fjdskfjdfsdjfkdsfjdsfsd";
			await t.typeText(queryInput, query, { replace: true });
		},

		"Then the page should display that no results have been found": async (t: TestController) => {
			await t.expect(Selector('[data-testid="EmptyResults"]').exists).ok();
		},
	},
	[
		mockRequest("https://news.payvo.com/api?coins=ARK&page=1", "news/page-1"),
		mockRequest("https://news.payvo.com/api?coins=ARK&page=1&query=fjdskfjdfsdjfkdsfjdsfsd", "news/empty-response"),
	],
);
