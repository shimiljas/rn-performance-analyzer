interface RecommendationsProps {
  hasCritical: boolean;
  hasVerySlow: boolean;
  topComponent?: { name: string; count: number };
}

export default function Recommendations({ hasCritical, hasVerySlow, topComponent }: RecommendationsProps) {
  const recommendations = [];

  if (hasCritical) {
    recommendations.push({
      priority: 'URGENT',
      title: 'Focus on components causing >100ms renders first',
      description: 'These are blocking the UI and causing visible stuttering',
      color: 'red'
    });
  }

  if (hasVerySlow) {
    recommendations.push({
      priority: 'HIGH',
      title: 'Optimize components with 50-100ms renders',
      description: 'These cause noticeable lag during user interactions',
      color: 'orange'
    });
  }

  if (topComponent && topComponent.count > 10) {
    recommendations.push({
      priority: 'MEDIUM',
      title: `'${topComponent.name}' is updating frequently (${topComponent.count} times)`,
      description: 'Consider: React.memo, useMemo, or useCallback to reduce re-renders',
      color: 'yellow'
    });
  }

  const generalTips = [
    'Use FlatList/FlashList with proper key extraction',
    'Memoize expensive computations with useMemo',
    'Virtualize long lists',
    'Lazy load images and heavy components',
    'Use InteractionManager for non-urgent work',
    'Profile with React DevTools to identify unnecessary renders',
    'Consider code splitting for large components'
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Recommendations
      </h3>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const colorClasses = {
            red: 'bg-red-50 border-red-200 text-red-900',
            orange: 'bg-orange-50 border-orange-200 text-orange-900',
            yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900'
          };

          return (
            <div key={index} className={`p-4 rounded-lg border-2 ${colorClasses[rec.color as keyof typeof colorClasses]}`}>
              <div className="flex items-start gap-2">
                <span className="px-2 py-1 text-xs font-bold bg-white rounded">
                  {rec.priority}
                </span>
                <div>
                  <div className="font-semibold">{rec.title}</div>
                  <div className="text-sm mt-1 opacity-90">{rec.description}</div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">General Optimizations:</h4>
          <ul className="space-y-2">
            {generalTips.map((tip, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-blue-500 mt-0.5">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
