import React from "react";
import cn from 'classnames';
import { Spinner } from '../Spinner';

export const Loader = ({
    text,
    className,
}: {
    text: string;
    className?: string;
}) => {
    return (
      <div className={cn("w-full px-6 py-5 border border-theme-warning-200 bg-theme-warning-50 dark:bg-transparent dark:border-theme-warning-600 flex flex-row gap-3 rounded-xl items-center", className)} data-testid="Loader__wrapper">
        <Spinner color='warning-alt' size='sm' className='rounded-full' width={3}/>
        <hr className='h-5 w-px border-transparent bg-theme-warning-200 dark:bg-theme-secondary-800' />
        <span className='font-semibold md:text-base text-sm text-theme-secondary-700 dark:text-theme-warning-600' data-testid="Loader__text">{text}</span>
      </div>
    )
  }