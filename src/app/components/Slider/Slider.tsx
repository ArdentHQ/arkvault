import React from "react";

import { useSlider } from "./hooks";

interface SliderProperties {
	children?: any;
	data?: any;
	options?: any;
	className?: string;
	paginationPosition?: "bottom-center" | "top-right";
}

export const Slider = ({
	children,
	data,
	options,
	className,
	paginationPosition = "bottom-center",
}: SliderProperties) => {
	const { showPagination, containerHeight, slideStyles, wrapperRef } = useSlider({
		container: ".slide-container",
		data,
		options,
		paginationPosition,
	});

	const renderChildNode = (data: any, index: number) => {
		if (typeof children === "function") {
			return children(data, index);
		}
		return <div />;
	};

	return (
		<div className="relative">
			{showPagination && paginationPosition === "top-right" && (
				<div className="swiper-pagination absolute right-0 -top-12 flex h-6 w-auto items-center space-x-2" />
			)}

			<div
				className="slide-container -mx-4.5 -mb-8 list-none overflow-hidden px-4.5"
				style={{ height: `${containerHeight}px` }}
			>
				<div className={`swiper-wrapper important:z-0 h-full ${className || ""}`} ref={wrapperRef}>
					{data.map((item: any, index: number) => (
						<div className="swiper-slide" key={index} style={slideStyles}>
							{{ ...renderChildNode(item, index) }}
						</div>
					))}
				</div>

				{showPagination && paginationPosition === "bottom-center" && (
					<div className="swiper-pagination important:bottom-8 important:z-0 flex h-6 items-center justify-center" />
				)}
			</div>
		</div>
	);
};
