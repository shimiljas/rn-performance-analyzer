
export const SLOW_RENDER_THRESHOLD = 16;
export const VERY_SLOW_RENDER_THRESHOLD = 50; 
export const CRITICAL_RENDER_THRESHOLD = 100; 

export interface CommitInfo {
  duration: number;
  timestamp: number;
  updaters: Array<{ displayName: string }>;
  components_affected: number;
}

export interface ComponentStats {
  count: number;
  total_duration: number;
  max_duration: number;
}

export interface AnalysisResults {
  total_commits: number;
  slow_commits: CommitInfo[];
  very_slow_commits: CommitInfo[];
  critical_commits: CommitInfo[];
  component_stats: Record<string, ComponentStats>;
}

export interface SlowFiber {
  component: string;
  duration: number;
  timestamp: number;
}

export interface PageMetrics {
  pageName: string;
  totalDuration: number;
  renderCount: number;
  avgDuration: number;
  maxDuration: number;
  criticalRenders: number;
  slowRenders: number;
  components: string[];
}

export interface PageAnalysisResults {
  pages: PageMetrics[];
  totalPages: number;
  slowestPage: PageMetrics | null;
}

export interface PerformanceInsights {
  // Frame Rate Analysis
  droppedFrames: number;
  avgFrameTime: number;
  fps: number;
  frameDropPercentage: number;
  
  // Component Patterns
  unnecessaryRenders: number;
  deepComponentTrees: string[];
  frequentUpdaters: Array<{ name: string; count: number }>;
  
  // List Performance
  listComponents: Array<{ name: string; renderTime: number; itemCount?: number }>;
  heavyListRenders: number;
  
  // Memory & Bundle
  largeComponents: Array<{ name: string; size: number }>;
  mountedComponents: number;
  
  // Threading
  jsThreadBlocking: number;
  uiThreadBlocking: number;
  bridgeCalls: number;
  
  // Navigation & Transitions
  slowNavigationTransitions: number;
  navigationComponents: string[];
  
  // Image & Media
  imageOptimizationIssues: number;
  largeImages: string[];
  
  // State Management
  stateManagementIssues: Array<{
    type: 'context-overuse' | 'prop-drilling' | 'unnecessary-state';
    component: string;
    description: string;
  }>;
  
  // Development Practices
  consoleStatements: number;
  devModeEnabled: boolean;
  inlineStyles: number;
  
  // Bridge Communication
  excessiveBridgeCalls: number;
  nativeModuleCalls: number;
  
  // Critical Issues
  criticalPatterns: Array<{
    type: 'inline-functions' | 'missing-memo' | 'heavy-computation' | 'deep-nesting' | 
          'slow-list' | 'sync-bridge' | 'image-resize' | 'no-native-driver' | 
          'blocking-operation' | 'memory-leak' | 'dev-mode' | 'console-log' |
          'missing-key' | 'flatlist-optimization' | 'scroll-performance' | 'text-on-image';
    component: string;
    severity: 'critical' | 'warning' | 'info';
    description: string;
    recommendation: string;
    impact: 'startup' | 'runtime' | 'navigation' | 'list' | 'animation' | 'memory';
  }>;
  
  // Performance Budget
  startupTimeEstimate: number;
  ttiBudget: number;
  
  // Overall Health Score (0-100)
  healthScore: number;
  performanceGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  
  // Recommendations by priority
  topRecommendations: Array<{
    priority: 1 | 2 | 3;
    title: string;
    description: string;
    impact: string;
    effort: 'low' | 'medium' | 'high';
  }>;
}

export interface TraceEvent {
  name: string;
  cat?: string;
  ph: string;
  ts: number;
  pid?: number;
  tid?: number;
  args?: any;
}

export interface TraceData {
  traceEvents?: TraceEvent[];
  dataForRoots?: any[];
}

export interface ConvertedProfileData {
  dataForRoots: Array<{
    commitData: any[];
    snapshots: any[];
  }>;
}

/**
 * Convert Chrome DevTools trace format to React profiling format
 */
export function convertTraceToProfile(traceData: TraceData): ConvertedProfileData {
  const converted: ConvertedProfileData = {
    dataForRoots: [{
      commitData: [],
      snapshots: []
    }]
  };

  const events = traceData.traceEvents || [];
  const componentStack: Array<{ name: string; startTime: number; event: TraceEvent }> = [];
  let fiberIdCounter = 0;
  const fiberMap: Record<string, number> = {};

  for (const event of events) {
    const name = event.name || '';
    const phase = event.ph || '';
    const ts = event.ts || 0;

    // Handle component mount/update events
    if (phase === 'b') {
      // Begin event
      componentStack.push({
        name,
        startTime: ts,
        event
      });
    } else if (phase === 'e' && componentStack.length > 0) {
      // End event
      const componentInfo = componentStack.pop()!;
      const duration = (ts - componentInfo.startTime) / 1000; // Convert microseconds to milliseconds

      if (duration > 0) {
        // Create commit entry
        const commit = {
          duration,
          timestamp: componentInfo.startTime,
          updaters: [{ displayName: componentInfo.name }],
          changeDescriptions: [],
          fiberActualDurations: [] as [number, number][]
        };

        // Add fiber ID mapping
        if (!(componentInfo.name in fiberMap)) {
          fiberMap[componentInfo.name] = fiberIdCounter;
          converted.dataForRoots[0].snapshots.push([
            fiberIdCounter,
            { displayName: componentInfo.name }
          ]);
          fiberIdCounter++;
        }

        const fiberId = fiberMap[componentInfo.name];
        commit.fiberActualDurations.push([fiberId, duration]);

        converted.dataForRoots[0].commitData.push(commit);
      }
    }
  }

  return converted;
}

/**
 * Analyze commit data for slow renders
 */
export function analyzeCommits(data: TraceData | ConvertedProfileData): AnalysisResults {
  const results: AnalysisResults = {
    total_commits: 0,
    slow_commits: [],
    very_slow_commits: [],
    critical_commits: [],
    component_stats: {}
  };

  const roots = (data as any).dataForRoots || [];
  
  for (const root of roots) {
    for (const commit of root.commitData || []) {
      const duration = commit.duration || 0;
      results.total_commits++;

      // Categorize by severity
      const commitInfo: CommitInfo = {
        duration,
        timestamp: commit.timestamp || 0,
        updaters: commit.updaters || [],
        components_affected: (commit.changeDescriptions || []).length
      };

      if (duration >= CRITICAL_RENDER_THRESHOLD) {
        results.critical_commits.push(commitInfo);
      } else if (duration >= VERY_SLOW_RENDER_THRESHOLD) {
        results.very_slow_commits.push(commitInfo);
      } else if (duration >= SLOW_RENDER_THRESHOLD) {
        results.slow_commits.push(commitInfo);
      }

      // Track component-level stats
      for (const updater of commit.updaters || []) {
        const name = updater.displayName || 'Unknown';
        if (!results.component_stats[name]) {
          results.component_stats[name] = {
            count: 0,
            total_duration: 0,
            max_duration: 0
          };
        }
        results.component_stats[name].count++;
        results.component_stats[name].total_duration += duration;
        results.component_stats[name].max_duration = Math.max(
          results.component_stats[name].max_duration,
          duration
        );
      }
    }
  }

  return results;
}

/**
 * Analyze individual fiber (component) render durations
 */
export function analyzeFiberDurations(data: TraceData | ConvertedProfileData): SlowFiber[] {
  const fiberMap: Record<number, string> = {};

  // Build fiber ID to name mapping from snapshots
  const roots = (data as any).dataForRoots || [];
  for (const root of roots) {
    const snapshots = root.snapshots || [];
    if (Array.isArray(snapshots)) {
      for (const snapshotEntry of snapshots) {
        if (Array.isArray(snapshotEntry) && snapshotEntry.length >= 2) {
          const fiberId = snapshotEntry[0];
          const fiberData = snapshotEntry[1];
          if (fiberData && typeof fiberData === 'object') {
            const name = fiberData.displayName || `Fiber-${fiberId}`;
            if (name) {
              fiberMap[fiberId] = name;
            }
          }
        }
      }
    }
  }

  const slowFibers: SlowFiber[] = [];

  for (const root of roots) {
    for (const commit of root.commitData || []) {
      for (const [fiberId, duration] of commit.fiberActualDurations || []) {
        if (duration >= SLOW_RENDER_THRESHOLD) {
          const componentName = fiberMap[fiberId] || `Component-${fiberId}`;
          slowFibers.push({
            component: componentName,
            duration,
            timestamp: commit.timestamp || 0
          });
        }
      }
    }
  }

  return slowFibers;
}

/**
 * Load and process profile data
 */
export function loadProfileData(jsonData: any): { data: ConvertedProfileData; isConverted: boolean } {
  let data = jsonData;
  let isConverted = false;

  // Check if this is a Chrome DevTools trace format and convert if needed
  if ('traceEvents' in data && !('dataForRoots' in data)) {
    data = convertTraceToProfile(data);
    isConverted = true;
  }

  return { data, isConverted };
}

/**
 * Get top components by total time
 */
export function getTopComponents(
  componentStats: Record<string, ComponentStats>,
  limit: number = 10
): Array<[string, ComponentStats]> {
  return Object.entries(componentStats)
    .sort((a, b) => b[1].total_duration - a[1].total_duration)
    .slice(0, limit);
}

/**
 * Get slowest individual renders
 */
export function getSlowestRenders(
  slowFibers: SlowFiber[],
  limit: number = 15
): SlowFiber[] {
  return [...slowFibers]
    .sort((a, b) => b.duration - a.duration)
    .slice(0, limit);
}

/**
 * Detect if a component name represents a page/screen
 */
function isPageComponent(componentName: string): boolean {
  const pagePatterns = [
    /Screen$/i,
    /Page$/i,
    /Navigator/i,
    /Stack\.Screen/i,
    /Tab\.Screen/i,
    /Drawer\.Screen/i,
    /.*HomeScreen/i,
    /.*ProfileScreen/i,
    /.*SettingsScreen/i,
    /.*DetailScreen/i,
    /.*ListScreen/i,
    /.*LoginScreen/i,
    /.*Dashboard/i,
    /Navigation/i,
  ];
  
  return pagePatterns.some(pattern => pattern.test(componentName));
}

/**
 * Extract page name from component name
 */
function extractPageName(componentName: string): string {
  // Remove common prefixes
  let pageName = componentName.replace(/^(Lazy|Memo|ForwardRef|Anonymous)\(/, '').replace(/\)$/, '');
  
  // Extract screen name from Stack.Screen format
  if (pageName.includes('.')) {
    const parts = pageName.split('.');
    pageName = parts[parts.length - 1];
  }
  
  // Clean up the name
  pageName = pageName.replace(/Screen$|Page$/, '').trim();
  
  return pageName || componentName;
}

/**
 * Analyze performance by page/screen
 */
export function analyzeByPage(data: TraceData | ConvertedProfileData): PageAnalysisResults {
  const pageMap = new Map<string, {
    totalDuration: number;
    renderCount: number;
    maxDuration: number;
    criticalRenders: number;
    slowRenders: number;
    components: Set<string>;
  }>();

  const roots = (data as any).dataForRoots || [];
  
  // First pass: identify pages and their metrics
  for (const root of roots) {
    for (const commit of root.commitData || []) {
      const duration = commit.duration || 0;
      
      for (const updater of commit.updaters || []) {
        const componentName = updater.displayName || 'Unknown';
        
        // Determine page name
        let pageName = 'Other Components';
        
        if (isPageComponent(componentName)) {
          pageName = extractPageName(componentName);
        } else {
          // Try to infer page from common patterns
          const commonPages = ['Home', 'Profile', 'Settings', 'Detail', 'List', 'Login', 'Dashboard', 'Search', 'Cart', 'Checkout'];
          for (const page of commonPages) {
            if (componentName.toLowerCase().includes(page.toLowerCase())) {
              pageName = page;
              break;
            }
          }
        }
        
        if (!pageMap.has(pageName)) {
          pageMap.set(pageName, {
            totalDuration: 0,
            renderCount: 0,
            maxDuration: 0,
            criticalRenders: 0,
            slowRenders: 0,
            components: new Set()
          });
        }
        
        const pageData = pageMap.get(pageName)!;
        pageData.totalDuration += duration;
        pageData.renderCount++;
        pageData.maxDuration = Math.max(pageData.maxDuration, duration);
        pageData.components.add(componentName);
        
        if (duration >= CRITICAL_RENDER_THRESHOLD) {
          pageData.criticalRenders++;
        } else if (duration >= VERY_SLOW_RENDER_THRESHOLD) {
          pageData.slowRenders++;
        }
      }
    }
  }

  // Convert to PageMetrics array
  const pages: PageMetrics[] = Array.from(pageMap.entries()).map(([pageName, data]) => ({
    pageName,
    totalDuration: data.totalDuration,
    renderCount: data.renderCount,
    avgDuration: data.renderCount > 0 ? data.totalDuration / data.renderCount : 0,
    maxDuration: data.maxDuration,
    criticalRenders: data.criticalRenders,
    slowRenders: data.slowRenders,
    components: Array.from(data.components)
  }));

  // Sort by total duration (slowest first)
  pages.sort((a, b) => b.totalDuration - a.totalDuration);

  return {
    pages,
    totalPages: pages.length,
    slowestPage: pages.length > 0 ? pages[0] : null
  };
}

/**
 * Generate comprehensive performance insights based on React Native best practices
 */
export function generatePerformanceInsights(
  analysisResults: AnalysisResults,
  slowFibers: SlowFiber[],
  data: TraceData | ConvertedProfileData
): PerformanceInsights {
  const insights: PerformanceInsights = {
    droppedFrames: 0,
    avgFrameTime: 0,
    fps: 60,
    frameDropPercentage: 0,
    unnecessaryRenders: 0,
    deepComponentTrees: [],
    frequentUpdaters: [],
    listComponents: [],
    heavyListRenders: 0,
    largeComponents: [],
    mountedComponents: 0,
    jsThreadBlocking: 0,
    uiThreadBlocking: 0,
    bridgeCalls: 0,
    slowNavigationTransitions: 0,
    navigationComponents: [],
    imageOptimizationIssues: 0,
    largeImages: [],
    stateManagementIssues: [],
    consoleStatements: 0,
    devModeEnabled: false,
    inlineStyles: 0,
    excessiveBridgeCalls: 0,
    nativeModuleCalls: 0,
    criticalPatterns: [],
    startupTimeEstimate: 0,
    ttiBudget: 2000,
    healthScore: 100,
    performanceGrade: 'A',
    topRecommendations: []
  };

  const totalCommits = analysisResults.total_commits;
  if (totalCommits === 0) return insights;

  // Calculate frame metrics
  const totalDuration = Object.values(analysisResults.component_stats)
    .reduce((sum, stat) => sum + stat.total_duration, 0);
  insights.avgFrameTime = totalCommits > 0 ? totalDuration / totalCommits : 0;
  insights.fps = insights.avgFrameTime > 0 ? Math.min(60, 1000 / insights.avgFrameTime) : 60;
  
  // Dropped frames (renders > 16ms)
  insights.droppedFrames = analysisResults.slow_commits.length + 
                           analysisResults.very_slow_commits.length + 
                           analysisResults.critical_commits.length;
  insights.frameDropPercentage = (insights.droppedFrames / totalCommits) * 100;

  // === COMPONENT ANALYSIS ===
  
  // Identify frequent updaters (potential unnecessary renders)
  const frequentUpdaters = Object.entries(analysisResults.component_stats)
    .filter(([_, stats]) => stats.count > 20)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([name, stats]) => ({ name, count: stats.count }));
  
  insights.frequentUpdaters = frequentUpdaters;
  insights.unnecessaryRenders = frequentUpdaters.reduce((sum, u) => sum + Math.max(0, u.count - 10), 0);

  // === LIST PERFORMANCE ANALYSIS ===
  const listPatterns = /FlatList|SectionList|VirtualizedList|ScrollView|RecyclerListView|FlashList|LegendList/i;
  Object.entries(analysisResults.component_stats).forEach(([name, stats]) => {
    if (listPatterns.test(name)) {
      insights.listComponents.push({
        name,
        renderTime: stats.total_duration,
        itemCount: stats.count
      });
      if (stats.max_duration > 50) {
        insights.heavyListRenders++;
        
        // Check if it's a basic FlatList (not FlashList/LegendList)
        if (/FlatList|ScrollView/.test(name) && !/(Flash|Legend)/.test(name)) {
          insights.criticalPatterns.push({
            type: 'flatlist-optimization',
            component: name,
            severity: 'warning',
            description: `${name} is slow (${stats.max_duration.toFixed(0)}ms). Consider using FlashList or LegendList`,
            recommendation: 'Replace FlatList with @shopify/flash-list or @legendapp/list for better performance. Implement getItemLayout, windowSize, and removeClippedSubviews',
            impact: 'list'
          });
        }
      }
    }
  });

  // === IMAGE & MEDIA ANALYSIS ===
  const imageComponents = Object.entries(analysisResults.component_stats)
    .filter(([name]) => /Image|Img|Photo|Picture|Avatar/i.test(name));
  
  imageComponents.forEach(([name, stats]) => {
    if (stats.max_duration > 50) {
      insights.imageOptimizationIssues++;
      insights.largeImages.push(name);
      insights.criticalPatterns.push({
        type: 'image-resize',
        component: name,
        severity: 'warning',
        description: 'Image component causing slow renders - likely missing optimization',
        recommendation: 'Use transform: [{scale}] instead of width/height for animations. Optimize image sizes, use FastImage, implement progressive loading',
        impact: 'runtime'
      });
    }
  });

  // === NAVIGATION ANALYSIS ===
  const navigationPatterns = /Navigator|Navigation|Stack|Tab|Drawer|Router|Screen/i;
  Object.entries(analysisResults.component_stats).forEach(([name, stats]) => {
    if (navigationPatterns.test(name)) {
      insights.navigationComponents.push(name);
      if (stats.max_duration > 100) {
        insights.slowNavigationTransitions++;
        insights.criticalPatterns.push({
          type: 'blocking-operation',
          component: name,
          severity: 'critical',
          description: `Slow navigation transition (${stats.max_duration.toFixed(0)}ms) blocking UI`,
          recommendation: 'Use InteractionManager.runAfterInteractions(), defer heavy operations, implement screen preloading, use native stack navigator',
          impact: 'navigation'
        });
      }
    }
  });

  // === ANIMATION ANALYSIS ===
  const animatedComponents = Object.entries(analysisResults.component_stats)
    .filter(([name]) => /Animated|Reanimated|Motion|Transition/i.test(name))
    .filter(([_, stats]) => stats.max_duration > 16);
  
  animatedComponents.forEach(([name, stats]) => {
    insights.criticalPatterns.push({
      type: 'no-native-driver',
      component: name,
      severity: stats.max_duration > 50 ? 'critical' : 'warning',
      description: `Animation causing frame drops (${stats.max_duration.toFixed(0)}ms per frame)`,
      recommendation: 'Always use useNativeDriver: true for Animated API. Consider React Native Reanimated 4 for complex animations. Avoid animating layout properties',
      impact: 'animation'
    });
  });

  // === COMPONENT SIZE & COMPLEXITY ===
  const largeComponents = Object.entries(analysisResults.component_stats)
    .filter(([_, stats]) => stats.max_duration > 100)
    .sort((a, b) => b[1].max_duration - a[1].max_duration)
    .slice(0, 10)
    .map(([name, stats]) => ({ name, size: stats.max_duration }));
  
  insights.largeComponents = largeComponents;
  insights.mountedComponents = Object.keys(analysisResults.component_stats).length;

  // === THREAD ANALYSIS ===
  insights.jsThreadBlocking = analysisResults.critical_commits.length;
  insights.uiThreadBlocking = analysisResults.very_slow_commits.length;

  // === STARTUP TIME ESTIMATE ===
  const mountComponents = Object.entries(analysisResults.component_stats)
    .filter(([name]) => /Mount|Provider|App|Root|Index/i.test(name));
  
  insights.startupTimeEstimate = mountComponents.reduce((sum, [_, stats]) => sum + stats.max_duration, 0);

  // === CRITICAL PATTERNS DETECTION ===
  
  // Pattern 1: Missing memoization
  frequentUpdaters.forEach(updater => {
    if (updater.count > 30 && !/(memo|Memo|Pure)/i.test(updater.name)) {
      insights.criticalPatterns.push({
        type: 'missing-memo',
        component: updater.name,
        severity: 'critical',
        description: `Component re-renders ${updater.count} times without memoization`,
        recommendation: 'Wrap with React.memo(), use useMemo for expensive calculations, useCallback for function props. Enable React Compiler for automatic optimization',
        impact: 'runtime'
      });
    }
  });

  // Pattern 2: Deep nesting
  const nestedComponents = Object.keys(analysisResults.component_stats)
    .filter(name => name.includes('.') || /ForwardRef|Anonymous|HOC/i.test(name));
  
  if (nestedComponents.length > 10) {
    insights.deepComponentTrees = nestedComponents.slice(0, 5);
    insights.criticalPatterns.push({
      type: 'deep-nesting',
      component: nestedComponents[0],
      severity: 'warning',
      description: `${nestedComponents.length} deeply nested or wrapped components detected`,
      recommendation: 'Extract inline components to named components, flatten component hierarchy, reduce HOC wrapping, use composition over inheritance',
      impact: 'runtime'
    });
  }

  // Pattern 3: Slow startup
  if (insights.startupTimeEstimate > 1000) {
    const slowestStartupComponent = mountComponents.sort((a, b) => b[1].max_duration - a[1].max_duration)[0];
    if (slowestStartupComponent) {
      insights.criticalPatterns.push({
        type: 'heavy-computation',
        component: slowestStartupComponent[0],
        severity: 'critical',
        description: `App startup takes ${insights.startupTimeEstimate.toFixed(0)}ms - exceeding 1 second budget`,
        recommendation: 'Enable Hermes engine, use React.lazy() and Suspense, implement code splitting, defer non-critical initialization with InteractionManager, optimize bundle size',
        impact: 'startup'
      });
    }
  }

  // Pattern 4: ScrollView issues
  const scrollViews = Object.entries(analysisResults.component_stats)
    .filter(([name]) => /ScrollView/i.test(name) && !/Flat|Flash|Legend/i.test(name))
    .filter(([_, stats]) => stats.count > 50);
  
  scrollViews.forEach(([name, stats]) => {
    insights.criticalPatterns.push({
      type: 'scroll-performance',
      component: name,
      severity: 'warning',
      description: `ScrollView with ${stats.count} renders - likely rendering all children at once`,
      recommendation: 'Replace ScrollView with FlatList or FlashList for long lists. Use windowSize, removeClippedSubviews, and getItemLayout for optimization',
      impact: 'list'
    });
  });

  // Pattern 5: Text on Image (Android performance killer)
  const viewComponents = Object.keys(analysisResults.component_stats).filter(name => /View|Container/i.test(name));
  const textComponents = Object.keys(analysisResults.component_stats).filter(name => /Text|Label/i.test(name));
  
  if (imageComponents.length > 0 && textComponents.length > 0 && viewComponents.length > 5) {
    insights.criticalPatterns.push({
      type: 'text-on-image',
      component: 'Layout',
      severity: 'info',
      description: 'Multiple Text and Image components detected - beware of transparent text over images',
      recommendation: 'On Android, avoid transparent backgrounds on Text over Image. Use renderToHardwareTextureAndroid prop or solid backgrounds for better performance',
      impact: 'runtime'
    });
  }

  // Pattern 6: Console statements detection
  const componentNames = Object.keys(analysisResults.component_stats).join(' ');
  if (/console|log|debug|Logger|Debug/i.test(componentNames)) {
    insights.consoleStatements = componentNames.match(/console|log|debug/gi)?.length || 0;
    if (insights.consoleStatements > 0) {
      insights.criticalPatterns.push({
        type: 'console-log',
        component: 'Multiple Components',
        severity: 'warning',
        description: `Detected ${insights.consoleStatements} potential console.log statements in component names`,
        recommendation: 'Remove all console.log statements in production. Use babel-plugin-transform-remove-console or implement a proper logging service',
        impact: 'runtime'
      });
    }
  }

  // === CALCULATE HEALTH SCORE ===
  let score = 100;
  
  // Critical issues (high impact)
  score -= analysisResults.critical_commits.length * 5; // -5 per critical render
  score -= insights.slowNavigationTransitions * 8; // -8 per slow navigation
  score -= insights.startupTimeEstimate > 2000 ? 15 : insights.startupTimeEstimate > 1000 ? 10 : 0;
  
  // Major issues
  score -= analysisResults.very_slow_commits.length * 2; // -2 per slow render
  score -= insights.heavyListRenders * 3; // -3 per heavy list
  score -= Math.min(20, insights.unnecessaryRenders * 0.1); // Penalty for unnecessary renders
  
  // Minor issues
  score -= Math.min(10, largeComponents.length * 2); // -2 per large component
  score -= Math.min(5, insights.imageOptimizationIssues * 1); // -1 per image issue
  score -= Math.min(5, insights.consoleStatements); // -1 per console statement
  
  // Frame performance impact
  if (insights.fps < 30) score -= 15;
  else if (insights.fps < 45) score -= 10;
  else if (insights.fps < 55) score -= 5;
  
  insights.healthScore = Math.max(0, Math.round(score));
  
  // Assign grade
  if (insights.healthScore >= 90) insights.performanceGrade = 'A';
  else if (insights.healthScore >= 75) insights.performanceGrade = 'B';
  else if (insights.healthScore >= 60) insights.performanceGrade = 'C';
  else if (insights.healthScore >= 45) insights.performanceGrade = 'D';
  else insights.performanceGrade = 'F';

  // === GENERATE TOP RECOMMENDATIONS ===
  insights.topRecommendations = [];
  
  if (insights.startupTimeEstimate > 1000) {
    insights.topRecommendations.push({
      priority: 1,
      title: 'Optimize App Startup Time',
      description: `Current startup takes ${insights.startupTimeEstimate.toFixed(0)}ms. Target is under 1 second.`,
      impact: 'Critical - First impression, app store ratings',
      effort: 'medium'
    });
  }
  
  if (insights.fps < 50) {
    insights.topRecommendations.push({
      priority: 1,
      title: 'Improve Frame Rate to 60 FPS',
      description: `Currently at ${insights.fps.toFixed(1)} FPS. Animations appear janky.`,
      impact: 'Critical - User experience, perceived smoothness',
      effort: 'high'
    });
  }
  
  if (insights.slowNavigationTransitions > 2) {
    insights.topRecommendations.push({
      priority: 1,
      title: 'Fix Slow Navigation Transitions',
      description: `${insights.slowNavigationTransitions} screens have slow transitions (>100ms)`,
      impact: 'High - Navigation feels sluggish',
      effort: 'medium'
    });
  }
  
  if (insights.heavyListRenders > 3) {
    insights.topRecommendations.push({
      priority: 2,
      title: 'Optimize List Performance',
      description: `${insights.heavyListRenders} lists are rendering slowly`,
      impact: 'High - Scrolling performance, memory usage',
      effort: 'low'
    });
  }
  
  if (insights.unnecessaryRenders > 50) {
    insights.topRecommendations.push({
      priority: 2,
      title: 'Reduce Unnecessary Re-renders',
      description: `${insights.unnecessaryRenders} excess renders detected. Enable React Compiler`,
      impact: 'Medium - Battery life, responsiveness',
      effort: 'low'
    });
  }
  
  if (insights.imageOptimizationIssues > 0) {
    insights.topRecommendations.push({
      priority: 3,
      title: 'Optimize Image Rendering',
      description: `${insights.imageOptimizationIssues} images causing slow renders`,
      impact: 'Medium - Load times, memory usage',
      effort: 'low'
    });
  }

  return insights;
}
