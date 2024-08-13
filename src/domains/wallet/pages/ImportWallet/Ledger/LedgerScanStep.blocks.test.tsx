import React from "react";
import { LedgerMobileItem } from './LedgerScanStep.blocks';
import { render } from '@/utils/testing-library';
import { vi } from 'vitest';
import userEvent from "@testing-library/user-event";

const sampleAddress = "ASuusXSW9kfWnicScSgUTjttP6T9GQ3kqT";
const sampleBalance = 1000;
const sampleCoin = "ARK";

describe('LedgerMobileItem', () => {
    it('should render', () => {
        const { container } = render(
            <LedgerMobileItem isLoading={false} address={sampleAddress} balance={sampleBalance} coin={sampleCoin} isSelected={false} handleClick={() => {}} />
        );

        expect(container).toMatchSnapshot();
    })

    it('should render skeleton', () => {
        const { container } = render(
            <LedgerMobileItem isLoading={true} address={sampleAddress} balance={sampleBalance} coin={sampleCoin} isSelected={false} handleClick={() => {}} />
        );

        // expect LedgerMobileItem__skeleton to be in the document as test id
        expect(container.querySelector("[data-testid='LedgerMobileItem__skeleton']")).toBeInTheDocument()
        expect(container).toMatchSnapshot();
    })

    it('should render selected', () => {
        const { container } = render(
            <LedgerMobileItem isLoading={false} address={sampleAddress} balance={sampleBalance} coin={sampleCoin} isSelected={true} handleClick={() => {}} />
        );

        expect(container.querySelector("[data-testid='LedgerMobileItem__checkbox']")).toHaveAttribute("checked");
    })

    it('should call handleClick', async () => {
        const handleClick = vi.fn();
        
        const { container } = render(
            <LedgerMobileItem isLoading={false} address={sampleAddress} balance={sampleBalance} coin={sampleCoin} isSelected={false} handleClick={handleClick} />
        );

        expect(container.querySelector("[data-testid='LedgerMobileItem__checkbox']")).toBeInTheDocument();

        await userEvent.click(container.querySelector("[data-testid='LedgerMobileItem__checkbox']"));
        expect(handleClick).toHaveBeenCalled();
    })

    it('should render dark theme', () => {
        const { container } = render(
            <LedgerMobileItem isLoading={false} address={sampleAddress} balance={sampleBalance} coin={sampleCoin} isSelected={false} handleClick={() => {}} />,
            { theme: 'dark' }
        );

        expect(container).toMatchSnapshot();
    })
});
