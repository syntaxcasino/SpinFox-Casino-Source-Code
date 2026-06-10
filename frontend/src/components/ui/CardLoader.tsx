import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CardLoader = () => {
  return (
    <div className="w-full flex cursor-pointer flex-col bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border rounded-[16px] overflow-hidden">
      <SkeletonTheme baseColor="var(--skeleton-base)" highlightColor="var(--skeleton-highlight)">
        <Skeleton className="h-[30px]" count={6} />
      </SkeletonTheme>
    </div>
  );
};

export default CardLoader;
