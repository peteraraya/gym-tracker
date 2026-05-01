/**
 * Performance monitoring utilities
 * 
 * Provides hooks and functions to measure and track performance metrics
 */

import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  bundleSize?: number;
  cacheHitRate?: number;
  renderTime?: number;
  apiRequestCount?: number;
}

// Development-only performance logging
const isDev = process.env.NODE_ENV === 'development';

export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    
    if (isDev) {
      console.log(`[Performance] ${componentName} rendered ${renderCount.current} times`);
    }
  });

  useEffect(() => {
    const loadTime = Date.now() - mountTime.current;
    
    if (isDev) {
      console.log(`[Performance] ${componentName} mounted in ${loadTime}ms`);
    }

    return () => {
      if (isDev) {
        console.log(`[Performance] ${componentName} unmounted after ${renderCount.current} renders`);
      }
    };
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    mountTime: mountTime.current,
  };
}

// Measure bundle size (client-side approximation)
export function measureBundleSize(): number {
  if (typeof window === 'undefined') return 0;
  
  try {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const totalSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    if (isDev) {
      console.log(`[Performance] Total JS bundle size: ${(totalSize / 1024).toFixed(2)} KB`);
    }
    
    return totalSize;
  } catch (error) {
    console.error('[Performance] Error measuring bundle size:', error);
    return 0;
  }
}

// Measure cache hit rate for React Query
export function measureCacheHitRate(queryClient: any): number {
  if (!queryClient) return 0;
  
  try {
    const cache = queryClient.getQueryCache();
    const queries = cache.getAll();
    
    const cachedQueries = queries.filter((q: any) => q.state.data !== undefined);
    const hitRate = queries.length > 0 ? (cachedQueries.length / queries.length) * 100 : 0;
    
    if (isDev) {
      console.log(`[Performance] Cache hit rate: ${hitRate.toFixed(1)}% (${cachedQueries.length}/${queries.length})`);
    }
    
    return hitRate;
  } catch (error) {
    console.error('[Performance] Error measuring cache hit rate:', error);
    return 0;
  }
}

// Track API request count
let apiRequestCount = 0;

export function trackAPIRequest() {
  apiRequestCount += 1;
  
  if (isDev) {
    console.log(`[Performance] API request #${apiRequestCount}`);
  }
}

export function getAPIRequestCount(): number {
  return apiRequestCount;
}

export function resetAPIRequestCount() {
  apiRequestCount = 0;
}

// Measure page load metrics
export function measurePageLoadMetrics() {
  if (typeof window === 'undefined') return null;
  
  try {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      // First Contentful Paint
      fcp: 0,
      // Largest Contentful Paint
      lcp: 0,
      // Time to Interactive
      tti: navigation.domInteractive - navigation.fetchStart,
      // Total load time
      loadTime: navigation.loadEventEnd - navigation.fetchStart,
    };

    // Get FCP
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    if (fcpEntry) {
      metrics.fcp = fcpEntry.startTime;
    }

    // Get LCP
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // LCP not supported
    }

    if (isDev) {
      console.log('[Performance] Page load metrics:', metrics);
    }

    return metrics;
  } catch (error) {
    console.error('[Performance] Error measuring page load metrics:', error);
    return null;
  }
}

// Log performance summary
export function logPerformanceSummary(metrics: PerformanceMetrics) {
  if (!isDev) return;
  
  console.group('[Performance] Summary');
  if (metrics.bundleSize) {
    console.log(`Bundle Size: ${(metrics.bundleSize / 1024).toFixed(2)} KB`);
  }
  if (metrics.cacheHitRate !== undefined) {
    console.log(`Cache Hit Rate: ${metrics.cacheHitRate.toFixed(1)}%`);
  }
  if (metrics.renderTime) {
    console.log(`Render Time: ${metrics.renderTime.toFixed(2)}ms`);
  }
  if (metrics.apiRequestCount) {
    console.log(`API Requests: ${metrics.apiRequestCount}`);
  }
  console.groupEnd();
}
