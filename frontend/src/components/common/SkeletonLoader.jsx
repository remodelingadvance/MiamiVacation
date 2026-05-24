const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className="rounded-2xl overflow-hidden">
            <div className="skeleton h-56 w-full" />
            <div className="p-4 space-y-3">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-6 w-1/3" />
            </div>
          </div>
        );

      case 'detail':
        return (
          <div className="space-y-6">
            <div className="skeleton h-96 w-full rounded-2xl" />
            <div className="space-y-3">
              <div className="skeleton h-8 w-1/2" />
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          </div>
        );

      case 'list':
        return (
          <div className="flex gap-4 p-4">
            <div className="skeleton h-24 w-24 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-4 w-3/4" />
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-1/4" />
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="skeleton h-20 w-20 rounded-full" />
              <div className="space-y-2">
                <div className="skeleton h-6 w-32" />
                <div className="skeleton h-4 w-48" />
              </div>
            </div>
            <div className="space-y-3">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-3/4" />
            </div>
          </div>
        );

      default:
        return <div className="skeleton h-20 w-full rounded-lg" />;
    }
  };

  return (
    <div className="grid gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </div>
  );
};

export default SkeletonLoader;