import React from "react";

import { render, screen } from "@/utils/testing-library";

import { RouteSuspense } from "./RouteSuspense";

describe("RouteSuspense", () => {
	let LazyComponent;

	beforeEach(() => {
		LazyComponent = React.lazy(() => Promise.resolve({ default: () => <p>content</p> }));
	});

	it("should render Suspense with skeleton component if specified", async () => {
		const SkeletonComponent = () => <p>skeleton</p>;

		render(
			<RouteSuspense skeleton={SkeletonComponent} path="/path">
				<LazyComponent />
			</RouteSuspense>,
		);

		expect(screen.getByText("skeleton")).toBeInTheDocument();

		await expect(screen.findByText("content")).resolves.toBeVisible();
	});

	it("should render Suspense with ProfilePageSkeleton if path starts with /profiles", async () => {
		render(
			<RouteSuspense path="/profiles">
				<LazyComponent />
			</RouteSuspense>,
		);

		expect(screen.getByTestId("ProfilePageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText("content")).resolves.toBeVisible();
	});

	it("should render Suspense with PageSkeleton if path does not start with /profiles", async () => {
		render(
			<RouteSuspense path="/">
				<LazyComponent />
			</RouteSuspense>,
		);

		expect(screen.getByTestId("PageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText("content")).resolves.toBeVisible();
	});
});
