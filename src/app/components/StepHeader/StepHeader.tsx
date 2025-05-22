import React, { ReactNode } from "react";
import { Header } from "@/app/components//Header";
import { StepIndicator } from "@/app/components/StepIndicator";
import { useSteps } from "@/app/contexts";

export const StepHeader = ({
	title,
	titleIcon,
	subtitle,
	extra,
}: {
	title: string;
	titleIcon?: ReactNode;
	subtitle?: string;
	extra?: React.ReactNode;
}) => {
	const { activeStep, steps } = useSteps();

	if (activeStep === undefined) {
		return <Header title={title} subtitle={subtitle} />;
	}

	return (
		<div className="w-full sm:mt-8">
			<StepIndicator activeStepTitle={title} steps={Array.from({ length: steps })} activeIndex={activeStep} />

			<div className="flex flex-col justify-between sm:flex-row">
				<Header title={title} titleIcon={titleIcon} subtitle={subtitle} className="mt-8 hidden sm:block" />

				{extra && <div className="mt-8 sm:mt-0">{extra}</div>}
			</div>
		</div>
	);
};
