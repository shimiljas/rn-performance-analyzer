'use client';

import { useState } from 'react';
import Head from 'next/head';
import FileUpload from '@/components/FileUpload';
import MetricsOverview from '@/components/MetricsOverview';
import CriticalIssues from '@/components/CriticalIssues';
import ComponentTable from '@/components/ComponentTable';
import SlowRendersList from '@/components/SlowRendersList';
import Recommendations from '@/components/Recommendations';
import PageAnalysis from '@/components/PageAnalysis';
import PerformanceInsightsComponent from '@/components/PerformanceInsights';
import {
  loadProfileData,
  analyzeCommits,
  analyzeFiberDurations,
  analyzeByPage,
  generatePerformanceInsights,
  getTopComponents,
  getSlowestRenders,
  type AnalysisResults,
  type SlowFiber,
  type PageAnalysisResults,
  type PerformanceInsights
} from '@/lib/analyzer';

export default function Home() {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [slowFibers, setSlowFibers] = useState<SlowFiber[]>([]);
  const [pageAnalysis, setPageAnalysis] = useState<PageAnalysisResults | null>(null);
  const [performanceInsights, setPerformanceInsights] = useState<PerformanceInsights | null>(null);
  const [isConverted, setIsConverted] = useState(false);

  const handleFileLoad = (jsonData: any) => {
    try {
      // Load and convert profile data if needed
      const { data, isConverted: converted } = loadProfileData(jsonData);
      setIsConverted(converted);

      // Analyze the data
      const results = analyzeCommits(data);
      const fibers = analyzeFiberDurations(data);
      const pages = analyzeByPage(data);
      const insights = generatePerformanceInsights(results, fibers, data);

      setAnalysisResults(results);
      setSlowFibers(fibers);
      setPageAnalysis(pages);
      setPerformanceInsights(insights);
    } catch (error) {
      console.error('Error analyzing profile data:', error);
      alert('Error analyzing the trace file. Please make sure it\'s a valid format.');
    }
  };

  const topComponents = analysisResults
    ? getTopComponents(analysisResults.component_stats, 10)
    : [];

  const slowestRenders = slowFibers.length > 0
    ? getSlowestRenders(slowFibers, 15)
    : [];

  return (
    <>
      <Head>
        <title>React Native Performance Profiler</title>
        <meta name="description" content="Analyze React Native performance traces and identify bottlenecks" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              ⚛️ React Native Performance Profiler
            </h1>
            <p className="text-lg text-gray-600">
              Upload your trace.json to identify performance bottlenecks and optimization opportunities
            </p>
          </div>

          {/* File Upload */}
          <div className="mb-12">
            <FileUpload onFileLoad={handleFileLoad} />
            {isConverted && (
              <div className="mt-4 text-center text-sm text-blue-600">
                ℹ️ Chrome DevTools trace format detected and converted successfully
              </div>
            )}
          </div>

          {/* Analysis Results */}
          {analysisResults && (
            <div className="space-y-8">
              {/* Metrics Overview */}
              <MetricsOverview results={analysisResults} />

              {/* Performance Insights */}
              {performanceInsights && (
                <PerformanceInsightsComponent insights={performanceInsights} />
              )}

              {/* Page-Wise Analysis */}
              {pageAnalysis && (
                <PageAnalysis pageAnalysis={pageAnalysis} />
              )}

              {/* Critical Issues */}
              {analysisResults.critical_commits.length > 0 && (
                <CriticalIssues
                  commits={analysisResults.critical_commits}
                  title={`CRITICAL: ${analysisResults.critical_commits.length} renders took >100ms (blocking UI)`}
                  severity="critical"
                  limit={10}
                />
              )}

              {/* Very Slow Renders */}
              {analysisResults.very_slow_commits.length > 0 && (
                <CriticalIssues
                  commits={analysisResults.very_slow_commits}
                  title={`WARNING: ${analysisResults.very_slow_commits.length} renders took 50-100ms (noticeable lag)`}
                  severity="warning"
                  limit={5}
                />
              )}

              {/* Top Components Table */}
              {topComponents.length > 0 && (
                <ComponentTable
                  components={topComponents}
                  title="📊 Top 10 Most Expensive Components (by total time)"
                />
              )}

              {/* Slowest Individual Renders */}
              {slowestRenders.length > 0 && (
                <SlowRendersList slowFibers={slowestRenders} />
              )}

              {/* Recommendations */}
              <Recommendations
                hasCritical={analysisResults.critical_commits.length > 0}
                hasVerySlow={analysisResults.very_slow_commits.length > 10}
                topComponent={
                  topComponents.length > 0
                    ? { name: topComponents[0][0], count: topComponents[0][1].count }
                    : undefined
                }
              />
            </div>
          )}

          {/* Empty State */}
          {!analysisResults && (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">Upload a trace file to start analyzing performance</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-gray-500">
          <p>Built for React Native developers to optimize app performance</p>
        </footer>
      </main>
    </>
  );
}
