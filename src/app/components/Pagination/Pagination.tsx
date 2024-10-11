import cn from "classnames";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { styled } from "twin.macro";

import { PaginationProperties } from "./Pagination.contracts";
import { PaginationWrapper } from "./Pagination.styles";
import { PaginationSearch } from "./PaginationSearch";
import { Icon } from "@/app/components/Icon";
import { Button } from "@/app/components/Button";
import { SmAndAbove, Xs } from "@/app/components/Breakpoint";

const Wrapper = styled.nav`
	${PaginationWrapper}
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
		<Wrapper data-testid="Pagination" className={cn("w-full relative sm:w-auto",className)}>
			<SmAndAbove>
				<Button
					data-testid="Pagination__first"
					variant="secondary"
					onClick={() => onSelectPage((currentPage = 1))}
					disabled={!showPrevious}
					className="py-1.5 px-4"
				>
					<span>{t("COMMON.FIRST")}</span>
				</Button>

				<Button
					data-testid="Pagination__previous"
					variant="secondary"
					onClick={() => onSelectPage((currentPage -= 1))}
					disabled={!showPrevious}
					className="p-2.5 w-8 h-8"
				>
					<Icon name="ChevronLeftSmall" size="sm" />
				</Button>
			</SmAndAbove>

			<div className="flex rounded bg-theme-primary-100 dark:bg-theme-secondary-800">
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
					className="p-2.5 w-8 h-8"
				>
					<Icon name="ChevronRightSmall" size="sm" />
				</Button>

				<Button
					data-testid="Pagination__last"
					variant="secondary"
					onClick={() => onSelectPage((currentPage = totalPages))}
					disabled={!showNext}
					className="py-1.5 px-4"
				>
					<span>{t("COMMON.LAST")}</span>
				</Button>
			</SmAndAbove>

			<Xs>
				<div className="mt-2 flex space-x-2">
					<Button
						data-testid="Pagination__first"
						variant="secondary"
						onClick={() => onSelectPage((currentPage = 1))}
						disabled={!showPrevious}
						className="flex-1"
					>
						<Icon name="DoubleChevronLeftSmall" size="sm" />
					</Button>

					<Button
						data-testid="Pagination__previous"
						variant="secondary"
						onClick={() => onSelectPage((currentPage -= 1))}
						disabled={!showPrevious}
						className="flex-1"
					>
						<Icon name="ChevronLeftSmall" size="sm" />
					</Button>

					<Button
						data-testid="Pagination__next"
						variant="secondary"
						onClick={() => onSelectPage((currentPage += 1))}
						disabled={!showNext}
						className="flex-1"
					>
						<Icon name="ChevronRightSmall" size="sm" />
					</Button>

					<Button
						data-testid="Pagination__last"
						variant="secondary"
						onClick={() => onSelectPage((currentPage = totalPages))}
						disabled={!showNext}
						className="flex-1"
					>
						<Icon name="DoubleChevronRightSmall" size="sm" />
					</Button>
				</div>
			</Xs>
		</Wrapper>
	);
};

export { Pagination };
