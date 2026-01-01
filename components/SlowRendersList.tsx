import { SlowFiber } from '@/lib/analyzer';

interface SlowRendersListProps {
  slowFibers: SlowFiber[];
}

export default function SlowRendersList({ slowFibers }: SlowRendersListProps) {
  if (slowFibers.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">
          🐌 Slowest Individual Component Renders (>16ms)
        </h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {slowFibers.map((fiber, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">#{index + 1}</span>
                <span className="text-sm text-gray-900 font-medium truncate">
                  {fiber.component}
                </span>
              </div>
              <span className="text-sm font-bold text-red-600 ml-2 whitespace-nowrap">
                {fiber.duration.toFixed(2)}ms
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
