/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { vi } from "vitest";
import { rest } from "msw";
import { News } from "./News";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import filteredFixture from "@/tests/fixtures/news/filtered.json";
import emptyPageFixture from "@/tests/fixtures/news/empty-response.json";
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
import { server, requestMock } from "@/tests/mocks/server";

const newsBasePath = "https://news.arkvault.io/api";

const history = createHashHistory();
const newsURL = `/profiles/${getDefaultProfileId()}/news`;

const translations = buildTranslations();

const pageReply = (source: any) => {
	const { meta, data } = source;
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
		server.use(requestMock(`${newsBasePath}`, pageReply(page1Fixture)));

		vi.spyOn(window, "scrollTo").mockImplementation(vi.fn());
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
		server.use(
			rest.get(newsBasePath, (request, response, context) => {
				const page = request.url.searchParams.get("page");

				if (page === "1") {
					return response(context.status(200), context.json(pageReply(page1Fixture)));
				}

				return response(context.status(500), context.json({ code: "ETIMEDOUT" }));
			}),
		);

		const toastSpy = vi.spyOn(toasts, "error");

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
		server.use(
			rest.get(newsBasePath, (request, response, context) => {
				const page = request.url.searchParams.get("page");

				if (page === "1") {
					return response(context.status(200), context.json(pageReply(page1Fixture)));
				}

				return response(context.status(200), context.json(pageReply(page2Fixture)));
			}),
		);

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
		server.use(
			rest.get(newsBasePath, (request, response, context) => {
				const query = request.url.searchParams.get("query");

				if (query === "NoResult") {
					return response(context.status(200), context.json(emptyPageFixture));
				}
			}),
		);

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
		server.use(
			rest.get(newsBasePath, (request, response, context) => {
				const categories = request.url.searchParams.get("categories");

				if (categories) {
					return response(context.status(200), context.json(filteredFixture));
				}

				return response(context.status(200), context.json(pageReply(page1Fixture)));
			}),
		);

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

		const toastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		for (const category of ["Community", "Emergency", "Marketing", "Technical"]) {
			userEvent.click(screen.getByTestId(`NewsOptions__category-${category}`));
		}

		await waitFor(() => expect(screen.getAllByTestId("NewsCard")).toHaveLength(1));

		expect(toastSpy).toHaveBeenCalledWith(translations.NEWS.NEWS_OPTIONS.CATEGORY_WARNING);

		toastSpy.mockRestore();
	});
});
