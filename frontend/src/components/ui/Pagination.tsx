import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  showPreviousNext?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 3,
  showPreviousNext = true,
  className = '',
  size = 'md'
}) => {
  if (totalPages <= 1) return null;

  const sizeClasses = {
    sm: 'h-[32px] px-3 text-xs',
    md: 'h-[36px] px-4 text-sm',
    lg: 'h-[40px] px-5 text-base'
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const baseButtonClass = `${sizeClasses[size]} flex items-center justify-center rounded-[10px] transition-all duration-300 cursor-pointer`;
  const activeButtonClass = 'bg-primary text-white border border-primary';
  const inactiveButtonClass = 'bg-transparent hover:bg-primary/20 text-light-text dark:text-white border border-light-border dark:border-dark-border';
  const navButtonClass = 'bg-light-bg-secondary dark:bg-dark-bg-secondary border border-light-border dark:border-dark-border hover:scale-95 hover:bg-light-bg-tertiary dark:hover:bg-dark-bg-tertiary';
  const disabledButtonClass = 'opacity-50 cursor-not-allowed hover:scale-100';

  const renderPageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than or equal to maxVisiblePages
      return Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`${baseButtonClass} ${
            currentPage === i + 1 ? activeButtonClass : inactiveButtonClass
          }`}
        >
          {i + 1}
        </button>
      ));
    }

    const pages = [];
    const showFirstPage = currentPage > 2;
    const showLastPage = currentPage < totalPages - 1;
    const showFirstEllipsis = currentPage > 3;
    const showLastEllipsis = currentPage < totalPages - 2;

    // Always show first page
    if (showFirstPage) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className={`${baseButtonClass} ${
            currentPage === 1 ? activeButtonClass : inactiveButtonClass
          }`}
        >
          1
        </button>
      );
    }

    // Show first ellipsis
    if (showFirstEllipsis) {
      pages.push(
        <span key="first-ellipsis" className={`${baseButtonClass} text-light-text-secondary dark:text-white/50 cursor-default`}>
          ...
        </span>
      );
    }

    // Show current page and neighbors
    const startPage = Math.max(1, currentPage - 1);
    const endPage = Math.min(totalPages, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`${baseButtonClass} ${
            currentPage === i ? activeButtonClass : inactiveButtonClass
          }`}
        >
          {i}
        </button>
      );
    }

    // Show last ellipsis
    if (showLastEllipsis) {
      pages.push(
        <span key="last-ellipsis" className={`${baseButtonClass} text-light-text-secondary dark:text-white/50 cursor-default`}>
          ...
        </span>
      );
    }

    // Always show last page
    if (showLastPage) {
      pages.push(
        <button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          className={`${baseButtonClass} ${
            currentPage === totalPages ? activeButtonClass : inactiveButtonClass
          }`}
        >
          {totalPages}
        </button>
      );
    }

    return pages;
  };

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      {showPreviousNext && (
        <button
          className={`${baseButtonClass} ${navButtonClass} ${
            currentPage === 1 ? disabledButtonClass : ''
          }`}
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <img src="/chevron-left.svg" alt="Previous" className={`${iconSizeClasses[size]} dark:invert-0 invert`} />
        </button>
      )}

      {renderPageNumbers()}

      {showPreviousNext && (
        <button
          className={`${baseButtonClass} ${navButtonClass} ${
            currentPage === totalPages ? disabledButtonClass : ''
          }`}
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <img src="/chevron-right.svg" alt="Next" className={`${iconSizeClasses[size]} dark:invert-0 invert`} />
        </button>
      )}
    </div>
  );
};

export default Pagination;
