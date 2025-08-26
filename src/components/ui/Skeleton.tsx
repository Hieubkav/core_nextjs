'use client';

import React from 'react';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  width,
  height,
  rounded = false,
  animate = true,
}) => {
  const style: React.CSSProperties = {};
  
  if (width) {
    style.width = typeof width === 'number' ? `${width}px` : width;
  }
  
  if (height) {
    style.height = typeof height === 'number' ? `${height}px` : height;
  }

  return (
    <div
      className={`
        bg-gray-200
        ${animate ? 'animate-pulse' : ''}
        ${rounded ? 'rounded-full' : 'rounded'}
        ${className}
      `}
      style={style}
    />
  );
};

// Card skeleton
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`border rounded-lg p-4 space-y-3 ${className}`}>
      <Skeleton height={200} className="w-full" />
      <Skeleton height={20} className="w-3/4" />
      <Skeleton height={16} className="w-1/2" />
      <div className="flex space-x-2">
        <Skeleton height={32} className="w-20" />
        <Skeleton height={32} className="w-20" />
      </div>
    </div>
  );
};

// Table skeleton
export const TableSkeleton: React.FC<{ 
  rows?: number; 
  columns?: number;
  className?: string;
}> = ({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex space-x-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} height={20} className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} height={16} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
};

// List skeleton
export const ListSkeleton: React.FC<{ 
  items?: number;
  showAvatar?: boolean;
  className?: string;
}> = ({ 
  items = 5,
  showAvatar = false,
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-3">
          {showAvatar && (
            <Skeleton width={40} height={40} rounded />
          )}
          <div className="flex-1 space-y-2">
            <Skeleton height={16} className="w-3/4" />
            <Skeleton height={14} className="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

// Form skeleton
export const FormSkeleton: React.FC<{ 
  fields?: number;
  className?: string;
}> = ({ 
  fields = 4,
  className = '' 
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton height={16} className="w-1/4" />
          <Skeleton height={40} className="w-full" />
        </div>
      ))}
      <div className="flex space-x-2 pt-4">
        <Skeleton height={40} className="w-24" />
        <Skeleton height={40} className="w-24" />
      </div>
    </div>
  );
};

// Product grid skeleton
export const ProductGridSkeleton: React.FC<{ 
  items?: number;
  columns?: number;
  className?: string;
}> = ({ 
  items = 8,
  columns = 4,
  className = '' 
}) => {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
  };

  return (
    <div className={`grid gap-4 ${gridCols[columns as keyof typeof gridCols] || 'grid-cols-4'} ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="space-y-3">
          <Skeleton height={200} className="w-full" />
          <Skeleton height={16} className="w-full" />
          <Skeleton height={14} className="w-3/4" />
          <Skeleton height={20} className="w-1/2" />
        </div>
      ))}
    </div>
  );
};

// Text skeleton with multiple lines
export const TextSkeleton: React.FC<{ 
  lines?: number;
  className?: string;
}> = ({ 
  lines = 3,
  className = '' 
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton 
          key={index} 
          height={16} 
          className={index === lines - 1 ? 'w-3/4' : 'w-full'} 
        />
      ))}
    </div>
  );
};

// Avatar skeleton
export const AvatarSkeleton: React.FC<{ 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}> = ({ 
  size = 'md',
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  return (
    <Skeleton 
      className={`${sizes[size]} ${className}`}
      rounded 
    />
  );
};

// Dashboard skeleton
export const DashboardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <Skeleton height={32} className="w-48" />
        <Skeleton height={40} className="w-32" />
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-2">
            <Skeleton height={16} className="w-1/2" />
            <Skeleton height={24} className="w-3/4" />
            <Skeleton height={12} className="w-full" />
          </div>
        ))}
      </div>
      
      {/* Chart area */}
      <div className="border rounded-lg p-4">
        <Skeleton height={20} className="w-1/4 mb-4" />
        <Skeleton height={300} className="w-full" />
      </div>
      
      {/* Table */}
      <div className="border rounded-lg p-4">
        <Skeleton height={20} className="w-1/4 mb-4" />
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
};
