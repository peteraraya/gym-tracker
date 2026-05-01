/**
 * Performance metrics collection and reporting
 */

import { measureBundleSize, measureCacheHitRate, measurePageLoadMetrics, getAPIRequestCount } from './monitor';

export interface PerformanceReport {
  timestamp: string;
  pageLoad: {
    fcp: number;
    lcp: number;
    tti: number;
    loadTime: number;
  } | null;
  bundle: {
    size: number;
    sizeKB: string;
  };
  cache: {
    hitRate: number;
    hitRatePercent: string;
  };
  api: {
    requestCount: number;
  };
}

export async function collectPerformanceMetrics(queryClient?: any): Promise<PerformanceReport> {
  const bundleSize = measureBundleSize();
  const cacheHitRate = queryClient ? measureCacheHitRate(queryClient) : 0;
  const pageLoadMetrics = measurePageLoadMetrics();
  const apiRequestCount = getAPIRequestCount();

  return {
    timestamp: new Date().toISOString(),
    pageLoad: pageLoadMetrics,
    bundle: {
      size: bundleSize,
      sizeKB: `${(bundleSize / 1024).toFixed(2)} KB`,
    },
    cache: {
      hitRate: cacheHitRate,
      hitRatePercent: `${cacheHitRate.toFixed(1)}%`,
    },
    api: {
      requestCount: apiRequestCount,
    },
  };
}

export function generatePerformanceReport(report: PerformanceReport): string {
  return `
# Performance Report
Generated: ${new Date(report.timestamp).toLocaleString()}

## Page Load Metrics
${report.pageLoad ? `
- First Contentful Paint (FCP): ${report.pageLoad.fcp.toFixed(2)}ms
- Largest Contentful Paint (LCP): ${report.pageLoad.lcp.toFixed(2)}ms
- Time to Interactive (TTI): ${report.pageLoad.tti.toFixed(2)}ms
- Total Load Time: ${report.pageLoad.loadTime.toFixed(2)}ms
` : 'Not available'}

## Bundle Size
- Total JS Bundle: ${report.bundle.sizeKB}

## Cache Performance
- Cache Hit Rate: ${report.cache.hitRatePercent}

## API Usage
- Total API Requests: ${report.api.requestCount}
  `.trim();
}
