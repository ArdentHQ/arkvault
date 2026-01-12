import { render, screen } from "@/utils/testing-library";
import userEvent from "@testing-library/user-event";

import { TokensTableFooter } from "./TokensTable.blocks";

const getLoadMoreButton = () => screen.queryByTestId("tokens__fetch-more-button");

describe("TokensTableFooter", () => {
	it("should render empty state when tokensCount is 0", () => {
		render(
			<table>
				<tbody>
					<TokensTableFooter
						tokensCount={0}
						columnsCount={6}
						hasMore={false}
						isLoading={false}
						isLoadingMore={false}
						fetchMore={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(screen.getByTestId("EmptyResults")).toBeInTheDocument();
	});

	it("should render nothing when tokens count > 0 and hasMore is false", () => {
		render(
			<table>
				<tbody>
					<TokensTableFooter
						tokensCount={1}
						columnsCount={6}
						hasMore={false}
						isLoading={false}
						isLoadingMore={false}
						fetchMore={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(getLoadMoreButton()).not.toBeInTheDocument();
		expect(screen.queryByTestId("EmptyResults")).not.toBeInTheDocument();
	});

	it("should render nothing when isLoading is true", () => {
		render(
			<table>
				<tbody>
					<TokensTableFooter
						tokensCount={0}
						columnsCount={6}
						hasMore={true}
						isLoading={true}
						isLoadingMore={false}
						fetchMore={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(getLoadMoreButton()).not.toBeInTheDocument();
		expect(screen.queryByTestId("EmptyResults")).not.toBeInTheDocument();
	});

	it("should render load more button when hasMore is true", () => {
		render(
			<table>
				<tbody>
					<TokensTableFooter
						tokensCount={5}
						columnsCount={6}
						hasMore={true}
						isLoading={false}
						isLoadingMore={false}
						fetchMore={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		const button = getLoadMoreButton();
		expect(button).toBeInTheDocument();
		expect(button).toHaveTextContent("Load More");
		expect(button).not.toBeDisabled();
	});

	it("should call fetchMore when load more button is clicked", async () => {
		const user = userEvent.setup();
		const fetchMoreMock = vi.fn();

		render(
			<table>
				<tbody>
					<TokensTableFooter
						tokensCount={5}
						columnsCount={6}
						hasMore={true}
						isLoading={false}
						isLoadingMore={false}
						fetchMore={fetchMoreMock}
					/>
				</tbody>
			</table>,
		);

		await user.click(getLoadMoreButton());
		expect(fetchMoreMock).toHaveBeenCalledTimes(1);
	});

	it("should disable load more button when isLoadingMore is true", () => {
		render(
			<table>
				<tbody>
					<TokensTableFooter
						tokensCount={5}
						columnsCount={6}
						hasMore={true}
						isLoading={false}
						isLoadingMore={true}
						fetchMore={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(getLoadMoreButton()).toBeDisabled();
	});

	it("should show loading text when isLoadingMore is true", () => {
		render(
			<table>
				<tbody>
					<TokensTableFooter
						tokensCount={5}
						columnsCount={6}
						hasMore={true}
						isLoading={false}
						isLoadingMore={true}
						fetchMore={vi.fn()}
					/>
				</tbody>
			</table>,
		);

		expect(getLoadMoreButton()).toHaveTextContent("Loading");
	});
});
