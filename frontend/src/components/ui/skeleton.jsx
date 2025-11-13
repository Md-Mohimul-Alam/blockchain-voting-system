import React from "react";
import { cn } from "@/lib/utils";

const Skeleton = React.forwardRef(({ 
  className, 
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className
      )}
      {...props}
    />
  );
});

Skeleton.displayName = "Skeleton";

// Pre-built skeleton components for common use cases

// Text Skeleton
const SkeletonText = React.forwardRef(({ 
  lines = 1, 
  className,
  lineClassName,
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn(
            "h-4",
            index === lines - 1 && lines > 1 ? "w-3/4" : "w-full",
            lineClassName
          )}
        />
      ))}
    </div>
  );
});

SkeletonText.displayName = "SkeletonText";

// Card Skeleton
const SkeletonCard = React.forwardRef(({ 
  className,
  hasImage = true,
  hasAction = true,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        className
      )}
      {...props}
    >
      <div className="p-6 space-y-4">
        {hasImage && (
          <Skeleton className="h-48 w-full rounded-md" />
        )}
        <div className="space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <SkeletonText lines={3} />
          {hasAction && (
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-20" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SkeletonCard.displayName = "SkeletonCard";

// Profile Skeleton
const SkeletonProfile = React.forwardRef(({ 
  className,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center space-x-4",
        className
      )}
      {...props}
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
    </div>
  );
});

SkeletonProfile.displayName = "SkeletonProfile";

// Table Skeleton
const SkeletonTable = React.forwardRef(({ 
  rows = 5,
  columns = 4,
  className,
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={cn("w-full", className)} {...props}>
      {/* Table Header */}
      <div className="flex border-b pb-2 mb-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={`header-${colIndex}`}
            className={cn(
              "h-6 flex-1 mx-2",
              colIndex === 0 ? "w-20" : "flex-grow"
            )}
          />
        ))}
      </div>
      
      {/* Table Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex items-center space-x-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`row-${rowIndex}-col-${colIndex}`}
                className={cn(
                  "h-4 flex-1",
                  colIndex === 0 ? "w-16" : "flex-grow"
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

SkeletonTable.displayName = "SkeletonTable";

// Dashboard Stats Skeleton
const SkeletonStats = React.forwardRef(({ 
  count = 3,
  className,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid grid-cols-1 md:grid-cols-3 gap-6",
        className
      )}
      {...props}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

SkeletonStats.displayName = "SkeletonStats";

// Form Skeleton
const SkeletonForm = React.forwardRef(({ 
  fields = 4,
  className,
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={cn("space-y-6", className)} {...props}>
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-4 pt-4">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
});

SkeletonForm.displayName = "SkeletonForm";

// List Skeleton
const SkeletonList = React.forwardRef(({ 
  items = 5,
  className,
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={cn("space-y-4", className)} {...props}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
        </div>
      ))}
    </div>
  );
});

SkeletonList.displayName = "SkeletonList";

// Customizable Grid Skeleton
const SkeletonGrid = React.forwardRef(({ 
  rows = 3,
  cols = 3,
  gap = 6,
  className,
  itemClassName,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "grid",
        {
          "grid-cols-1": cols === 1,
          "grid-cols-2": cols === 2,
          "grid-cols-3": cols === 3,
          "grid-cols-4": cols === 4,
          "gap-4": gap === 4,
          "gap-6": gap === 6,
          "gap-8": gap === 8,
        },
        className
      )}
      {...props}
    >
      {Array.from({ length: rows * cols }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn("h-32 rounded-lg", itemClassName)}
        />
      ))}
    </div>
  );
});

SkeletonGrid.displayName = "SkeletonGrid";

// Complex Dashboard Skeleton
const SkeletonDashboard = React.forwardRef(({ 
  className,
  ...props 
}, ref) => {
  return (
    <div ref={ref} className={cn("space-y-8", className)} {...props}>
      {/* Header */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      
      {/* Stats */}
      <SkeletonStats count={4} />
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard hasImage={false} />
          <SkeletonTable rows={4} columns={3} />
        </div>
        
        {/* Right Column */}
        <div className="space-y-6">
          <SkeletonCard hasImage={false} hasAction={false} />
          <SkeletonList items={3} />
        </div>
      </div>
    </div>
  );
});

SkeletonDashboard.displayName = "SkeletonDashboard";

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonProfile,
  SkeletonTable,
  SkeletonStats,
  SkeletonForm,
  SkeletonList,
  SkeletonGrid,
  SkeletonDashboard,
};