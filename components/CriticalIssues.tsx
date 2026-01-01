import { CommitInfo } from '@/lib/analyzer';

interface CriticalIssuesProps {
  commits: CommitInfo[];
  title: string;
  severity: 'critical' | 'warning' | 'info';
  limit?: number;
}

export default function CriticalIssues({ commits, title, severity, limit = 10 }: CriticalIssuesProps) {
  if (commits.length === 0) return null;

  const severityStyles = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'CRITICAL',
      title: 'text-red-900'
    },
    warning: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'WARNING',
      title: 'text-orange-900'
    },
    info: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'INFO',
      title: 'text-yellow-900'
    }
  };

  const style = severityStyles[severity];
  const displayCommits = commits.slice(0, limit);

  return (
    <div className={`${style.bg} ${style.border} border-2 rounded-lg p-6`}>
      <h3 className={`text-lg font-bold ${style.title} mb-4`}>
        {title}
      </h3>

      <div className="space-y-3">
        {displayCommits.map((commit, index) => (
          <div key={index} className="bg-white rounded p-4 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              <span className="text-lg font-bold text-gray-900">
                {commit.duration.toFixed(2)}ms
              </span>
            </div>
            
            {commit.updaters.length > 0 && (
              <div className="space-y-1">
                {commit.updaters.map((updater, i) => (
                  <div key={i} className="text-sm text-gray-700">
                    <span className="font-medium">Component:</span> {updater.displayName}
                  </div>
                ))}
              </div>
            )}
            
            {commit.components_affected > 0 && (
              <div className="text-sm text-gray-600 mt-1">
                Affected components: {commit.components_affected}
              </div>
            )}
          </div>
        ))}
      </div>

      {commits.length > limit && (
        <div className="mt-4 text-sm text-gray-600 text-center">
          ... and {commits.length - limit} more {severity} renders
        </div>
      )}
    </div>
  );
}
