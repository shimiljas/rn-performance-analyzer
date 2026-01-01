import { PageAnalysisResults, PageMetrics } from '@/lib/analyzer';

interface PageAnalysisProps {
  pageAnalysis: PageAnalysisResults;
}

export default function PageAnalysis({ pageAnalysis }: PageAnalysisProps) {
  if (!pageAnalysis || pageAnalysis.pages.length === 0) {
    return null;
  }

  const getSeverityColor = (page: PageMetrics) => {
    if (page.criticalRenders > 0) {
      return {
        bg: 'bg-red-50',
        border: 'border-red-300',
        badge: 'bg-red-500',
        text: 'text-red-900'
      };
    } else if (page.slowRenders > 5) {
      return {
        bg: 'bg-orange-50',
        border: 'border-orange-300',
        badge: 'bg-orange-500',
        text: 'text-orange-900'
      };
    } else if (page.avgDuration > 16) {
      return {
        bg: 'bg-yellow-50',
        border: 'border-yellow-300',
        badge: 'bg-yellow-500',
        text: 'text-yellow-900'
      };
    }
    return {
      bg: 'bg-green-50',
      border: 'border-green-300',
      badge: 'bg-green-500',
      text: 'text-green-900'
    };
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <span>📱</span>
          Page-Wise Performance Analysis
        </h2>
        <p className="text-gray-600">
          Performance breakdown by screens and pages ({pageAnalysis.totalPages} detected)
        </p>
      </div>

      {/* Slowest Page Alert */}
      {pageAnalysis.slowestPage && pageAnalysis.slowestPage.criticalRenders > 0 && (
        <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h3 className="font-bold text-red-900">Slowest Page Detected</h3>
              <p className="text-red-800 text-sm mt-1">
                <span className="font-semibold">{pageAnalysis.slowestPage.pageName}</span> has{' '}
                {pageAnalysis.slowestPage.criticalRenders} critical renders and took{' '}
                {pageAnalysis.slowestPage.totalDuration.toFixed(2)}ms total
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pages Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {pageAnalysis.pages.map((page, index) => {
          const colors = getSeverityColor(page);
          
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border-2 rounded-lg p-5 hover:shadow-lg transition-all`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold ${colors.text} mb-1`}>
                    {page.pageName}
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {page.criticalRenders > 0 && (
                      <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                        {page.criticalRenders} Critical
                      </span>
                    )}
                    {page.slowRenders > 0 && (
                      <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded">
                        {page.slowRenders} Slow
                      </span>
                    )}
                  </div>
                </div>
                <div className={`w-3 h-3 rounded-full ${colors.badge}`}></div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500">Total Time</div>
                  <div className="text-lg font-bold text-gray-900">
                    {page.totalDuration.toFixed(0)}ms
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500">Renders</div>
                  <div className="text-lg font-bold text-gray-900">
                    {page.renderCount}
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500">Avg Duration</div>
                  <div className="text-lg font-bold text-gray-900">
                    {page.avgDuration.toFixed(1)}ms
                  </div>
                </div>
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500">Max Duration</div>
                  <div className="text-lg font-bold text-gray-900">
                    {page.maxDuration.toFixed(1)}ms
                  </div>
                </div>
              </div>

              {/* Components */}
              <div className="bg-white rounded p-2">
                <div className="text-xs text-gray-500 mb-1">
                  Components ({page.components.length})
                </div>
                <div className="flex flex-wrap gap-1">
                  {page.components.slice(0, 5).map((comp, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                    >
                      {comp}
                    </span>
                  ))}
                  {page.components.length > 5 && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">
                      +{page.components.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Performance Tips */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Page Optimization Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use <code className="bg-blue-100 px-1 rounded">React.lazy()</code> for code-splitting heavy screens</li>
          <li>• Implement <code className="bg-blue-100 px-1 rounded">useFocusEffect</code> for screen-specific logic</li>
          <li>• Defer non-critical renders with <code className="bg-blue-100 px-1 rounded">InteractionManager</code></li>
          <li>• Optimize navigation transitions with <code className="bg-blue-100 px-1 rounded">cardStyleInterpolator</code></li>
          <li>• Use <code className="bg-blue-100 px-1 rounded">React Navigation</code> screen options to optimize animations</li>
        </ul>
      </div>
    </div>
  );
}
