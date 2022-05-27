/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import nock from "nock";
import React from "react";
import { Route } from "react-router-dom";

import { News } from "./News";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import filteredFixture from "@/tests/fixtures/news/filtered.json";
import page1Fixture from "@/tests/fixtures/news/page-1.json";
import page2Fixture from "@/tests/fixtures/news/page-2.json";
import {
	getDefaultProfileId,
	render,
	renderResponsiveWithRoute,
	screen,
	waitFor,
	within,
} from "@/utils/testing-library";

const history = createHashHistory();
const newsURL = `/profiles/${getDefaultProfileId()}/news`;

const translations = buildTranslations();

jest.setTimeout(30_000);

const firstPageReply = () => {
	const { meta, data } = page1Fixture;
	return {
		data: data.slice(0, 1),
		meta,
	};
};

describe("News", () => {
	const renderPage = (breakpoint?: string) => {
		const pageComponent = (
			<Route path="/profiles/:profileId/news">
				<News />
			</Route>
		);

		const options = {
			history,
			route: newsURL,
		};

		if (breakpoint) {
			return renderResponsiveWithRoute(pageComponent, breakpoint, options);
		}

		return render(pageComponent, options);
	};

	beforeAll(() => {
		nock.disableNetConnect();

		nock("https://news.payvo.com")
			.get("/api?coins=ARK")
			.reply(200, firstPageReply)
			.get("/api?coins=ARK&page=1")
			.reply(200, firstPageReply)
			.get("/api")
			.query((parameters) => !!parameters.categories)
			.reply(200, filteredFixture)
			.get("/api?coins=ARK&query=NoResult&page=1")
			.reply(200, require("tests/fixtures/news/empty-response.json"))
			.persist();

		nock("https://news.payvo.com")
			.get("/api?coins=ARK&page=2")
			.replyWithError({ code: "ETIMEDOUT" })
			.get("/api?coins=ARK&page=2")
			.reply(200, () => {
				const { meta, data } = page2Fixture;
				return {
					data: data.slice(0, 1),
					meta,
				};
			});

		jest.spyOn(window, "scrollTo").mockImplementation();
	});

	beforeEach(() => {
		history.push(newsURL);
	});

	it.each(["xs", "md"])("should render responsive (%s)", async (breakpoint) => {
		const { asFragment } = renderPage(breakpoint);

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		expect(screen.getAllByTestId("NewsCard__content")[0]).toHaveTextContent(page1Fixture.data[0].text);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show error toast if news cannot be fetched", async () => {
		const toastSpy = jest.spyOn(toasts, "error");

		const { asFragment } = renderPage();

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		userEvent.click(screen.getByTestId("Pagination__next"));

		await waitFor(() => expect(screen.queryAllByTestId("NewsCard")).toHaveLength(0));
		await waitFor(() => expect(screen.queryAllByTestId("EmptyResults")).toHaveLength(1));

		expect(toastSpy).toHaveBeenCalledWith(translations.NEWS.PAGE_NEWS.ERRORS.NETWORK_ERROR);
		expect(asFragment()).toMatchSnapshot();

		toastSpy.mockRestore();
	});

	it("should navigate on next and previous pages", async () => {
		renderPage();

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		expect(screen.getAllByTestId("NewsCard__content")[0]).toHaveTextContent(page1Fixture.data[0].text);

		userEvent.click(screen.getByTestId("Pagination__next"));

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		expect(screen.getAllByTestId("NewsCard__content")[0]).toHaveTextContent(page2Fixture.data[0].text);

		userEvent.click(screen.getByTestId("Pagination__previous"));

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));
	});

	it("should show no results screen", async () => {
		renderPage();

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		const searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");

		expect(searchInput).toBeInTheDocument();

		userEvent.paste(searchInput, "NoResult");

		await waitFor(() => expect(searchInput).toHaveValue("NoResult"));

		await waitFor(() => expect(screen.queryAllByTestId("NewsCard")).toHaveLength(0));
		await waitFor(() => expect(screen.queryAllByTestId("EmptyResults")).toHaveLength(1));
	});

	it("should filter results based on category query and asset", async () => {
		const { asFragment } = renderPage();

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		expect(screen.getAllByTestId("NewsCard__content")[0]).toHaveTextContent(page1Fixture.data[0].text);
		expect(screen.getByTestId("NewsCard")).not.toHaveTextContent("Hacking");

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		let searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");

		userEvent.paste(searchInput, "Hacking");

		await waitFor(() => expect(searchInput).toHaveValue("Hacking"));

		for (const category of ["Community", "Emergency", "Marketing"]) {
			userEvent.click(screen.getByTestId(`NewsOptions__category-${category}`));
		}

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		expect(screen.getAllByTestId("NewsCard__content")[0]).toHaveTextContent(filteredFixture.data[0].text);

		userEvent.click(within(screen.getByTestId("HeaderSearchBar")).getByRole("button"));

		searchInput = within(screen.getByTestId("HeaderSearchBar__input")).getByTestId("Input");

		userEvent.clear(searchInput);

		await waitFor(() => expect(searchInput).not.toHaveValue());

		userEvent.click(screen.getByText(commonTranslations.SELECT_ALL));

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		await waitFor(() =>
			expect(screen.getAllByTestId("NewsCard__content")[0]).toHaveTextContent(page1Fixture.data[0].text),
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show warning toast when trying to deselect all categories", async () => {
		renderPage();

		const toastSpy = jest.spyOn(toasts, "warning").mockImplementation();

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		for (const category of ["Community", "Emergency", "Marketing", "Technical"]) {
			userEvent.click(screen.getByTestId(`NewsOptions__category-${category}`));
		}

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		expect(toastSpy).toHaveBeenCalledWith(translations.NEWS.NEWS_OPTIONS.CATEGORY_WARNING);

		toastSpy.mockRestore();
	});

	it("should show not found with empty coins", async () => {
		renderPage();

		await waitFor(() => expect(screen.queryAllByTestId("NewsCard")).toHaveLength(1));

		userEvent.click(screen.getByTestId("NetworkOption__ark.mainnet"));

		await waitFor(() => expect(screen.queryAllByTestId("NewsCard")).toHaveLength(0));
		await waitFor(() => expect(screen.queryAllByTestId("EmptyResults")).toHaveLength(1));
	});
});
