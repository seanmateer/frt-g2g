'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { TrailCenter, TrailReport, ConfidenceScore } from '@/types';
import { calculateConfidence } from '@/lib/confidence';
import {
  trailCenters,
  trailheads,
  trails,
  getAllReports,
  getReportsByCenter,
  addReport as addReportToStore,
} from '@/data';

export function useTrailStatus() {
  const [reports, setReports] = useState<TrailReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    // Simulating async data load
    const loadData = async () => {
      // In production, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 100));
      setReports(getAllReports());
      setIsLoading(false);
    };

    loadData();
  }, []);

  // Calculate status for all trail centers
  const statusMap = useMemo(() => {
    const map: Record<string, ConfidenceScore> = {};

    for (const center of trailCenters) {
      const centerReports = reports.filter((r) => r.trailCenterId === center.id);
      // Only consider reports from the last 72 hours for status calculation
      const recentReports = centerReports.filter((r) => {
        const reportAge = Date.now() - new Date(r.timestamp).getTime();
        return reportAge < 72 * 60 * 60 * 1000; // 72 hours
      });
      map[center.id] = calculateConfidence(recentReports);
    }

    return map;
  }, [reports]);

  // Add a new report
  const addReport = useCallback((report: Omit<TrailReport, 'id'>) => {
    const newReport = addReportToStore(report);
    setReports((prev) => [newReport, ...prev]);
    return newReport;
  }, []);

  // Get reports for a specific center
  const getReportsForCenter = useCallback(
    (centerId: string) => {
      return reports
        .filter((r) => r.trailCenterId === centerId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    },
    [reports]
  );

  // Get trails for a specific center
  const getTrailsForCenter = useCallback((centerId: string) => {
    return trails.filter((t) => t.trailCenterId === centerId);
  }, []);

  // Get trailheads for a specific center
  const getTrailheadsForCenter = useCallback((centerId: string) => {
    return trailheads.filter((th) => th.trailCenterId === centerId);
  }, []);

  // Get all unique regions
  const regions = useMemo(() => {
    return [...new Set(trailCenters.map((tc) => tc.region))].sort();
  }, []);

  return {
    trailCenters,
    trailheads,
    trails,
    reports,
    statusMap,
    regions,
    isLoading,
    addReport,
    getReportsForCenter,
    getTrailsForCenter,
    getTrailheadsForCenter,
  };
}
