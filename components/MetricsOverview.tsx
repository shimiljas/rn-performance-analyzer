import { AnalysisResults } from '@/lib/analyzer';

interface MetricsOverviewProps {
  results: AnalysisResults;
}

export default function MetricsOverview({ results }: MetricsOverviewProps) {
  const totalCommits = results.total_commits;
  const criticalCount = results.critical_commits.length;
  const verySlowCount = results.very_slow_commits.length;
  const slowCount = results.slow_commits.length;
  const goodCount = totalCommits - criticalCount - verySlowCount - slowCount;

  const criticalPercent = totalCommits > 0 ? (criticalCount / totalCommits * 100).toFixed(1) : '0';
  const verySlowPercent = totalCommits > 0 ? (verySlowCount / totalCommits * 100).toFixed(1) : '0';
  const slowPercent = totalCommits > 0 ? (slowCount / totalCommits * 100).toFixed(1) : '0';
  const goodPercent = totalCommits > 0 ? (goodCount / totalCommits * 100).toFixed(1) : '0';

  const metrics = [
    {
      label: 'Critical (>100ms)',
      count: criticalCount,
      percent: criticalPercent,
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'Very Slow (50-100ms)',
      count: verySlowCount,
      percent: verySlowPercent,
      color: 'bg-orange-500',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      label: 'Slow (16-50ms)',
      count: slowCount,
      percent: slowPercent,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    {
      label: 'Good (<16ms)',
      count: goodCount,
      percent: goodPercent,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Overview</h2>
        <p className="text-gray-600">Total renders analyzed: <span className="font-semibold">{totalCommits}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className={`${metric.bgColor} ${metric.borderColor} border-2 rounded-lg p-6 transition-transform hover:scale-105`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`w-3 h-3 rounded-full ${metric.color}`}></div>
              <span className={`text-sm font-medium ${metric.textColor}`}>
                {metric.percent}%
              </span>
            </div>
            <div className={`text-3xl font-bold ${metric.textColor} mb-1`}>
              {metric.count}
            </div>
            <div className="text-sm text-gray-600">{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
