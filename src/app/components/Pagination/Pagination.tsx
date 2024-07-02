import cn from "classnames";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "twin.macro";

import { SmAndAbove, Xs } from "@/app/components/Breakpoint";
import { Button } from "@/app/components/Button";
import { Icon } from "@/app/components/Icon";

import { PaginationProperties } from "./Pagination.contracts";
import { PaginationButton, PaginationWrapper } from "./Pagination.styles";
import { PaginationSearch } from "./PaginationSearch";

const Wrapper = styled.nav`
	${PaginationWrapper}
`;

const PaginationButtonStyled = styled.button`
	${PaginationButton}
`;

const Pagination = ({
	totalCount,
	itemsPerPage = 4,
	onSelectPage,
	currentPage = 1,
	className,
}: PaginationProperties) => {
	const [buttonsDisabled, setButtonsDisabled] = useState(false);

	const { t } = useTranslation();

	const totalPages = Math.ceil(totalCount / itemsPerPage);

	const buttonCount = useMemo(() => (currentPage < 100 ? 7 : 5), [currentPage]);
	const subRangeLength = useMemo(() => Math.floor(buttonCount / 2), [buttonCount]);

	const paginationButtons = useMemo(() => {
		let buttons: number[];

		if (totalPages <= buttonCount) {
			buttons = Array.from({ length: totalPages }).map((_, index) => index + 1);
		} else if (currentPage <= subRangeLength + 1) {
			buttons = Array.from({ length: buttonCount }).map((_, index) => index + 1);
		} else if (currentPage >= totalPages - subRangeLength) {
			buttons = Array.from({ length: buttonCount }).map((_, index) => totalPages - buttonCount + index + 1);
		} else {
			buttons = Array.from({ length: buttonCount }).map((_, index) => currentPage - subRangeLength + index);
		}

		return buttons;
	}, [currentPage, totalPages, buttonCount, subRangeLength]);

	const showPrevious = useMemo(() => currentPage > 1, [currentPage]);
	const showNext = useMemo(() => currentPage < totalPages, [currentPage, totalPages]);

	if (totalPages <= 1) {
		return <></>;
	}

	const handleSelectPage = (page?: number) => {
		setButtonsDisabled(false);

		if (page) {
			onSelectPage(page);
		}
	};

	return (
		<Wrapper data-testid="Pagination" className={className}>
			<SmAndAbove>
				<Button
					data-testid="Pagination__first"
					variant="secondary"
					onClick={() => onSelectPage((currentPage = 1))}
					disabled={!showPrevious}
				>
					<Icon name="DoubleChevronLeftSmall" size="sm" />
				</Button>

				<Button
					data-testid="Pagination__previous"
					variant="secondary"
					onClick={() => onSelectPage((currentPage -= 1))}
					disabled={!showPrevious}
				>
					<div>
						<span className="hidden lg:inline">{t("COMMON.PREVIOUS")}</span>

						<Icon name="ChevronLeftSmall" size="sm" className="lg:hidden" />
					</div>
				</Button>
			</SmAndAbove>

			<div className="relative flex hidden rounded bg-theme-primary-100 px-2 dark:bg-theme-secondary-800 md:flex">
				{paginationButtons[0] !== 1 && (
					<PaginationSearch
						onClick={() => setButtonsDisabled(true)}
						onSelectPage={handleSelectPage}
						totalPages={totalPages}
						isDisabled={buttonsDisabled}
					>
						<span>…</span>
					</PaginationSearch>
				)}

				{paginationButtons.map((page) => (
					<PaginationButtonStyled
						key={page}
						type="button"
						aria-current={currentPage === page || undefined}
						aria-label={t("COMMON.PAGE_#", { page })}
						disabled={buttonsDisabled}
						className={cn({ "current-page": currentPage === page })}
						onClick={() => onSelectPage(page)}
					>
						{page}
					</PaginationButtonStyled>
				))}

				{paginationButtons[paginationButtons.length - 1] !== totalPages && (
					<PaginationSearch
						onClick={() => setButtonsDisabled(true)}
						onSelectPage={handleSelectPage}
						totalPages={totalPages}
						isDisabled={buttonsDisabled}
					>
						<span>…</span>
					</PaginationSearch>
				)}
			</div>

			<div className="relative flex rounded bg-theme-primary-100 px-2 dark:bg-theme-secondary-800 md:hidden">
				<PaginationSearch
					onClick={() => setButtonsDisabled(true)}
					onSelectPage={handleSelectPage}
					totalPages={totalPages}
					isDisabled={buttonsDisabled}
				>
					<span className="font-semibold">
						{t("COMMON.PAGE_#_OF_#", { page: currentPage, total: totalPages })}
					</span>
				</PaginationSearch>
			</div>

			<SmAndAbove>
				<Button
					data-testid="Pagination__next"
					variant="secondary"
					onClick={() => onSelectPage((currentPage += 1))}
					disabled={!showNext}
				>
					<div>
						<span className="hidden lg:inline">{t("COMMON.NEXT")}</span>

						<Icon name="ChevronRightSmall" size="sm" className="lg:hidden" />
					</div>
				</Button>

				<Button
					data-testid="Pagination__last"
					variant="secondary"
					onClick={() => onSelectPage((currentPage = totalPages))}
					disabled={!showNext}
				>
					<Icon name="DoubleChevronRightSmall" size="sm" />
				</Button>
			</SmAndAbove>

			<Xs>
				<div className="mt-3 flex space-x-3">
					<Button
						data-testid="Pagination__first"
						variant="secondary"
						onClick={() => onSelectPage((currentPage = 1))}
						disabled={!showPrevious}
					>
						<Icon name="DoubleChevronLeftSmall" size="sm" />
					</Button>

					<Button
						data-testid="Pagination__previous"
						variant="secondary"
						onClick={() => onSelectPage((currentPage -= 1))}
						disabled={!showPrevious}
					>
						<Icon name="ChevronLeftSmall" size="sm" />
					</Button>

					<Button
						data-testid="Pagination__next"
						variant="secondary"
						onClick={() => onSelectPage((currentPage += 1))}
						disabled={!showNext}
					>
						<Icon name="ChevronRightSmall" size="sm" />
					</Button>

					<Button
						data-testid="Pagination__last"
						variant="secondary"
						onClick={() => onSelectPage((currentPage = totalPages))}
						disabled={!showNext}
					>
						<Icon name="DoubleChevronRightSmall" size="sm" />
					</Button>
				</div>
			</Xs>
		</Wrapper>
	);
};

export { Pagination };
