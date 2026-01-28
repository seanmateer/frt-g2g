import { NextRequest, NextResponse } from 'next/server';
import { TrailReport, TrailStatus } from '@/types';
import { addReport, getAllReports, getReportsByCenter } from '@/data/reports';
import { withCors, handleOptions } from '@/lib/cors';

// OPTIONS handler for CORS preflight
export async function OPTIONS(): Promise<NextResponse> {
  return handleOptions();
}

// GET /api/reports - Get all reports or filter by center
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const centerId = searchParams.get('centerId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    let reports: TrailReport[];

    if (centerId) {
      reports = getReportsByCenter(centerId);
    } else {
      reports = getAllReports();
    }

    // Apply limit
    reports = reports.slice(0, limit);

    return withCors(NextResponse.json({
      success: true,
      count: reports.length,
      reports
    }));
  } catch (error) {
    console.error('Error fetching reports:', error);
    return withCors(NextResponse.json(
      { success: false, error: 'Failed to fetch reports' },
      { status: 500 }
    ));
  }
}

// POST /api/reports - Submit a new report
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.trailCenterId) {
      return withCors(NextResponse.json(
        { success: false, error: 'trailCenterId is required' },
        { status: 400 }
      ));
    }

    if (!body.status || !isValidStatus(body.status)) {
      return withCors(NextResponse.json(
        { success: false, error: 'Valid status is required (open, muddy, snowy, closed)' },
        { status: 400 }
      ));
    }

    // Build the report object
    const reportData: Omit<TrailReport, 'id'> = {
      trailCenterId: body.trailCenterId,
      trailId: body.trailId || undefined,
      status: body.status as TrailStatus,
      comment: sanitizeComment(body.comment),
      timestamp: body.timestamp || new Date().toISOString(),
      reporterNickname: sanitizeNickname(body.reporterNickname),
      weatherTemp: body.weatherTemp,
      weatherCondition: body.weatherCondition,
    };

    // Add the report
    const newReport = addReport(reportData);

    // Log for debugging (in production, this would go to a proper logger)
    console.log('New report submitted:', {
      id: newReport.id,
      center: newReport.trailCenterId,
      status: newReport.status,
      source: body.source || 'app'
    });

    return withCors(NextResponse.json({
      success: true,
      report: newReport
    }, { status: 201 }));

  } catch (error) {
    console.error('Error submitting report:', error);
    return withCors(NextResponse.json(
      { success: false, error: 'Failed to submit report' },
      { status: 500 }
    ));
  }
}

// Validate status value
function isValidStatus(status: string): status is TrailStatus {
  return ['open', 'muddy', 'snowy', 'closed', 'unknown'].includes(status);
}

// Sanitize comment to prevent XSS and limit length
function sanitizeComment(comment: string | undefined): string | undefined {
  if (!comment) return undefined;

  return comment
    .trim()
    .substring(0, 1000) // Limit length
    .replace(/<[^>]*>/g, '') // Strip HTML tags
    .replace(/[<>]/g, ''); // Remove any remaining angle brackets
}

// Sanitize nickname
function sanitizeNickname(nickname: string | undefined): string | undefined {
  if (!nickname) return undefined;

  return nickname
    .trim()
    .substring(0, 50)
    .replace(/<[^>]*>/g, '')
    .replace(/[<>]/g, '');
}
