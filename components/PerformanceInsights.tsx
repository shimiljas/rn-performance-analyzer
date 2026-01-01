import { PerformanceInsights } from '@/lib/analyzer';

interface PerformanceInsightsProps {
  insights: PerformanceInsights;
}

export default function PerformanceInsightsComponent({ insights }: PerformanceInsightsProps) {
  const gradeColors = {
    A: 'bg-green-500 text-white',
    B: 'bg-blue-500 text-white',
    C: 'bg-yellow-500 text-white',
    D: 'bg-orange-500 text-white',
    F: 'bg-red-500 text-white'
  };

  const severityColors = {
    critical: 'bg-red-100 border-red-300 text-red-900',
    warning: 'bg-orange-100 border-orange-300 text-orange-900',
    info: 'bg-blue-100 border-blue-300 text-blue-900'
  };

  const impactIcons: Record<string, string> = {
    startup: 'Startup',
    runtime: 'Runtime',
    navigation: 'Navigation',
    list: 'List',
    animation: 'Animation',
    memory: 'Memory'
  };

  return (
    <div className="space-y-6">
      {/* Header with Health Score */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Performance Insights & Health Score
            </h2>
            <p className="text-purple-100">
              Comprehensive analysis based on React Native best practices
            </p>
          </div>
          <div className="text-center">
            <div className={`text-6xl font-bold px-8 py-4 rounded-lg ${gradeColors[insights.performanceGrade]}`}>
              {insights.performanceGrade}
            </div>
            <div className="text-sm mt-2 text-purple-100">
              Score: {insights.healthScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Top Priority Recommendations */}
      {insights.topRecommendations && insights.topRecommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border-2 border-indigo-300">
          <div className="bg-indigo-600 px-6 py-4">
            <h3 className="text-lg font-bold text-white">
              Top Priority Actions
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {insights.topRecommendations.map((rec, idx) => (
              <div key={idx} className="border-l-4 border-indigo-500 bg-indigo-50 p-4 rounded-r-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{rec.title}</span>
                    <span className="text-xs px-2 py-1 bg-indigo-600 text-white rounded-full">
                      Priority {rec.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      rec.effort === 'low' ? 'bg-green-200 text-green-800' :
                      rec.effort === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                      'bg-orange-200 text-orange-800'
                    }`}>
                      {rec.effort} effort
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">{rec.description}</p>
                <p className="text-xs text-gray-600"><strong>Impact:</strong> {rec.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* FPS */}
        <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
          insights.fps >= 55 ? 'border-green-500' : insights.fps >= 45 ? 'border-yellow-500' : 'border-red-500'
        }`}>
          <div className="text-sm text-gray-600 mb-1">Average FPS</div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.fps.toFixed(1)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Target: 60 FPS
          </div>
        </div>

        {/* Startup Time */}
        <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${
          insights.startupTimeEstimate < 1000 ? 'border-green-500' : 
          insights.startupTimeEstimate < 2000 ? 'border-yellow-500' : 'border-red-500'
        }`}>
          <div className="text-sm text-gray-600 mb-1">Startup Time</div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.startupTimeEstimate.toFixed(0)}ms
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Budget: {insights.ttiBudget}ms
          </div>
        </div>

        {/* Dropped Frames */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
          <div className="text-sm text-gray-600 mb-1">Dropped Frames</div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.droppedFrames}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {insights.frameDropPercentage.toFixed(1)}% of total
          </div>
        </div>

        {/* Components */}
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="text-sm text-gray-600 mb-1">Active Components</div>
          <div className="text-3xl font-bold text-gray-900">
            {insights.mountedComponents}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {insights.frequentUpdaters.length} frequent updaters
          </div>
        </div>
      </div>

      {/* Navigation & List Performance Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Navigation Performance */}
        {insights.navigationComponents && insights.navigationComponents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h4 className="font-bold text-gray-900 mb-4">
              Navigation Performance
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Navigation Components</span>
                <span className="text-lg font-bold text-blue-600">
                  {insights.navigationComponents.length}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-sm text-gray-600">Slow Transitions</span>
                <span className={`text-lg font-bold ${
                  insights.slowNavigationTransitions === 0 ? 'text-green-600' :
                  insights.slowNavigationTransitions < 3 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {insights.slowNavigationTransitions}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {insights.slowNavigationTransitions > 0 
                  ? 'Tip: Use InteractionManager.runAfterInteractions() for deferred work'
                  : 'All navigation transitions are smooth'}
              </div>
            </div>
          </div>
        )}

        {/* List Performance */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📋</span>
            List Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">List Components</span>
              <span className="text-lg font-bold text-blue-600">{insights.listComponents.length}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Heavy List Renders</span>
              <span className={`text-lg font-bold ${
                insights.heavyListRenders === 0 ? 'text-green-600' :
                insights.heavyListRenders < 3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {insights.heavyListRenders}
              </span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {insights.heavyListRenders > 0 
                ? 'Tip: Consider using @shopify/flash-list or @legendapp/list'
                : 'List performance is optimal'}
            </div>
          </div>
        </div>
      </div>

      {/* Threading & Image Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🧵</span>
            Thread Performance
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">JS Thread Blocking</span>
              <span className="text-lg font-bold text-red-600">{insights.jsThreadBlocking}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">UI Thread Blocking</span>
              <span className="text-lg font-bold text-orange-600">{insights.uiThreadBlocking}</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              High thread blocking can cause stuttering and unresponsive UI
            </div>
          </div>
        </div>

        {/* Image Optimization */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🖼️</span>
            Image & Media
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-sm text-gray-600">Optimization Issues</span>
              <span className={`text-lg font-bold ${
                insights.imageOptimizationIssues === 0 ? 'text-green-600' :
                insights.imageOptimizationIssues < 3 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {insights.imageOptimizationIssues}
              </span>
            </div>
            {insights.largeImages && insights.largeImages.length > 0 && (
              <div className="text-xs text-gray-600 border-t pt-2">
                Problematic images: {insights.largeImages.slice(0, 3).join(', ')}
                {insights.largeImages.length > 3 && ` +${insights.largeImages.length - 3} more`}
              </div>
            )}
            <div className="text-xs text-gray-500 mt-2">
              Tip: Use react-native-fast-image and proper image sizing
            </div>
          </div>
        </div>
      </div>

      {/* Development Practice Warnings */}
      {(insights.consoleStatements > 0 || insights.devModeEnabled || insights.inlineStyles > 0) && (
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-orange-300">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⚠️</span>
            Development Practice Warnings
          </h4>
          <div className="space-y-2 text-sm text-gray-700">
            {insights.consoleStatements > 0 && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                <div>
                  <strong>{insights.consoleStatements}</strong> potential console.log statements detected
                  <p className="text-xs text-gray-600 mt-1">
                    Remove with babel-plugin-transform-remove-console
                  </p>
                </div>
              </div>
            )}
            {insights.devModeEnabled && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                <div>
                  Dev mode enabled - significantly impacts performance
                  <p className="text-xs text-gray-600 mt-1">
                    Always test performance with production builds
                  </p>
                </div>
              </div>
            )}
            {insights.inlineStyles > 0 && (
              <div className="flex items-start gap-2 p-2 bg-orange-50 rounded">
                <div>
                  <strong>{insights.inlineStyles}</strong> inline style definitions detected
                  <p className="text-xs text-gray-600 mt-1">
                    Extract to StyleSheet.create() outside render
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* State Management Issues */}
      {insights.stateManagementIssues && insights.stateManagementIssues.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔄</span>
            State Management Issues
          </h4>
          <div className="space-y-2">
            {insights.stateManagementIssues.map((issue, idx) => (
              <div key={idx} className="border-l-4 border-purple-400 pl-3 py-2 bg-purple-50">
                <div className="font-semibold text-purple-900 capitalize">
                  {issue.type.replace('-', ' ')} - {issue.component}
                </div>
                <div className="text-sm text-gray-700 mt-1">{issue.description}</div>
              </div>
            ))}
            <div className="mt-3 p-3 bg-blue-50 rounded text-sm text-gray-700">
              <strong>Tip:</strong> Consider Zustand or Jotai for better performance than Context API
            </div>
          </div>
        </div>
      )}

      {/* Critical Patterns */}
      {insights.criticalPatterns.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              Critical Performance Patterns ({insights.criticalPatterns.length})
            </h3>
          </div>
          <div className="p-6 space-y-3">
            {insights.criticalPatterns.map((pattern, index) => (
              <div
                key={index}
                className={`${severityColors[pattern.severity]} border-2 rounded-lg p-4`}
              >
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-1 bg-white rounded text-xs font-bold uppercase">
                      {pattern.severity}
                    </span>
                    <span className="px-2 py-1 bg-white rounded text-xs font-mono">
                      {pattern.type}
                    </span>
                    {pattern.impact && (
                      <span className="px-2 py-1 bg-white rounded text-xs flex items-center gap-1">
                        {impactIcons[pattern.impact as keyof typeof impactIcons] || '⚡'}
                        {pattern.impact}
                      </span>
                    )}
                  </div>
                </div>
                <div className="font-semibold mb-1">{pattern.component}</div>
                <div className="text-sm mb-2">{pattern.description}</div>
                <div className="text-sm bg-white rounded p-2 mt-2">
                  <span className="font-semibold">Fix:</span> {pattern.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Frequent Updaters */}
      {insights.frequentUpdaters.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>🔄</span>
            Frequently Updating Components ({insights.unnecessaryRenders} unnecessary renders)
          </h4>
          <div className="space-y-2">
            {insights.frequentUpdaters.map((updater, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                  <span className="text-sm font-mono text-gray-900">{updater.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">{updater.count} renders</span>
                  {updater.count > 50 ? (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                      CRITICAL
                    </span>
                  ) : updater.count > 30 ? (
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded">
                      HIGH
                    </span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
            <strong>Quick Wins:</strong> Wrap with React.memo(), use useMemo/useCallback for props,
            or enable React Compiler for automatic optimization.
          </div>
        </div>
      )}

      {/* Large Components */}
      {insights.largeComponents.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>📦</span>
            Slowest Components (&gt;100ms)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.largeComponents.slice(0, 8).map((component, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <span className="text-sm font-mono text-gray-900 truncate flex-1">
                  {component.name}
                </span>
                <span className="text-sm font-bold text-red-600 ml-2 whitespace-nowrap">
                  {component.size.toFixed(0)}ms
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* React Native Best Practices Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span>⚛️</span>
          React Native Performance Best Practices Applied
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Analysis Includes:</h5>
            <ul className="space-y-1 text-gray-700">
              <li>• Frame rate analysis (60 FPS target)</li>
              <li>• JS/UI thread blocking detection</li>
              <li>• Navigation transition performance</li>
              <li>• List optimization (FlatList vs FlashList)</li>
              <li>• Animation performance checks</li>
              <li>• Image & media optimization</li>
              <li>• Component memoization suggestions</li>
              <li>• State management patterns</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-gray-800 mb-2">Recommended Tools:</h5>
            <ul className="space-y-1 text-gray-700">
              <li>• <strong>FlashList</strong> - Faster lists (@shopify/flash-list)</li>
              <li>• <strong>Reanimated 4</strong> - Smooth 60 FPS animations</li>
              <li>• <strong>Hermes</strong> - Optimized JS engine</li>
              <li>• <strong>Zustand/Jotai</strong> - Fast state management</li>
              <li>• <strong>React Compiler</strong> - Auto memoization</li>
              <li>• <strong>FastImage</strong> - Optimized image loading</li>
              <li>• <strong>Reassure</strong> - Performance regression testing</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
