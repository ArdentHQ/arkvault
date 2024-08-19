import userEvent from "@testing-library/user-event";
import React from "react";

import { Tab, TabList, TabPanel, Tabs, TabScroll } from "./Tabs";
import { render, screen } from "@/utils/testing-library";
import * as themeUtils from "@/utils/theme";
const activePanel = () => screen.getByTestId("tab-pabel__active-panel");

describe("Tabs", () => {
	it("should render", () => {
		const { container, asFragment } = render(
			<Tabs>
				<TabList>
					<Tab tabId={1}>First</Tab>
					<Tab tabId={2}>Second</Tab>
					<Tab tabId={3}>Third</Tab>
				</TabList>
				<div className="mt-5">
					<TabPanel tabId={1}>1</TabPanel>
					<TabPanel tabId={2}>2</TabPanel>
					<TabPanel tabId={3}>3</TabPanel>
				</div>
			</Tabs>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render wit counts", () => {
		const { container, asFragment } = render(
			<Tabs>
				<TabList noBackground>
					<Tab tabId={1} count={1}>
						First
					</Tab>
					<Tab tabId={2} count={2}>
						Second
					</Tab>
					<Tab tabId={3} count={3}>
						Third
					</Tab>
				</TabList>
				<div className="mt-5">
					<TabPanel tabId={1}>1</TabPanel>
					<TabPanel tabId={2}>2</TabPanel>
					<TabPanel tabId={3}>3</TabPanel>
				</div>
			</Tabs>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render without background", () => {
		const { container, asFragment } = render(
			<Tabs>
				<TabList noBackground>
					<Tab tabId={1}>First</Tab>
					<Tab tabId={2}>Second</Tab>
					<Tab tabId={3}>Third</Tab>
				</TabList>
				<div className="mt-5">
					<TabPanel tabId={1}>1</TabPanel>
					<TabPanel tabId={2}>2</TabPanel>
					<TabPanel tabId={3}>3</TabPanel>
				</div>
			</Tabs>,
		);

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with scroll", () => {
		const { container, asFragment } = render(
			<Tabs>
				<TabScroll>
					<TabList noBackground>
						<Tab tabId={1}>First</Tab>
						<Tab tabId={2}>Second</Tab>
						<Tab tabId={3}>Third</Tab>
					</TabList>
				</TabScroll>
			</Tabs>,
		);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("TabScroll")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with scroll in dark mode", () => {
		const useDarkColorsSpy = vi.spyOn(themeUtils, "shouldUseDarkColors").mockImplementationOnce(() => true);

		const { container, asFragment } = render(
			<Tabs>
				<TabScroll>
					<TabList noBackground>
						<Tab tabId={1}>First</Tab>
						<Tab tabId={2}>Second</Tab>
						<Tab tabId={3}>Third</Tab>
					</TabList>
				</TabScroll>
			</Tabs>,
		);

		expect(container).toBeInTheDocument();
		expect(screen.getByTestId("TabScroll")).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();

		useDarkColorsSpy.mockRestore();
	});

	it("should react to use effect call", async () => {
		const { container, asFragment } = render(
			<Tabs activeId={2}>
				<TabList>
					<Tab tabId={1}>First</Tab>
					<Tab tabId={2}>Second</Tab>
				</TabList>
				<TabPanel tabId={1}>1</TabPanel>
				<TabPanel tabId={2}>2</TabPanel>
			</Tabs>,
		);

		await userEvent.click(screen.getByTestId("tabs__tab-button-1"));

		expect(container).toBeInTheDocument();
		expect(activePanel()).toHaveTextContent("1");
		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle switching tabs", async () => {
		render(
			<Tabs activeId={1}>
				<TabList>
					<Tab tabId={1}>First</Tab>
					<div>separator</div>
					<Tab tabId={2}>Second</Tab>
				</TabList>
				<TabPanel tabId={1}>1</TabPanel>
				<TabPanel tabId={2}>2</TabPanel>
			</Tabs>,
		);

		const firstTab = screen.getByTestId("tabs__tab-button-1");
		const secondTab = screen.getByTestId("tabs__tab-button-2");

		expect(firstTab).toHaveAttribute("aria-selected", "true");
		expect(secondTab).toHaveAttribute("aria-selected", "false");

		firstTab.focus();

		expect(firstTab).toHaveFocus();

		// got right to second tab
		await userEvent.keyboard("{arrowright}");

		expect(firstTab).not.toHaveFocus();
		expect(secondTab).toHaveFocus();

		await userEvent.keyboard("{enter}");

		expect(activePanel()).toHaveTextContent("2");

		expect(firstTab).toHaveAttribute("aria-selected", "false");
		expect(secondTab).toHaveAttribute("aria-selected", "true");

		// go right to first tab
		await userEvent.keyboard("{arrowright}");

		expect(firstTab).toHaveFocus();
		expect(secondTab).not.toHaveFocus();

		await userEvent.keyboard("{Spacebar}");

		expect(activePanel()).toHaveTextContent("1");

		// go left to second tab
		await userEvent.keyboard("{arrowleft}");

		expect(firstTab).not.toHaveFocus();
		expect(secondTab).toHaveFocus();

		await userEvent.keyboard("{enter}");

		expect(activePanel()).toHaveTextContent("2");

		// go left to first tab
		await userEvent.keyboard("{arrowleft}");

		expect(firstTab).toHaveFocus();
		expect(secondTab).not.toHaveFocus();

		await userEvent.keyboard("{Spacebar}");

		expect(activePanel()).toHaveTextContent("1");

		// tab away
		await userEvent.tab();
	});
});
