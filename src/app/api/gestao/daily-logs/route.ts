import { NextRequest, NextResponse } from 'next/server';
import { getDailyLogsByRange, getDailyLogByDate, saveDailyLog } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (date) {
      const log = getDailyLogByDate(date);
      return NextResponse.json({ success: true, log });
    }

    if (startDate && endDate) {
      const logs = getDailyLogsByRange(startDate, endDate);
      return NextResponse.json({ success: true, logs });
    }

    // Default to current week if none provided
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = monday.toISOString().slice(0, 10);
    const end = sunday.toISOString().slice(0, 10);

    const logs = getDailyLogsByRange(start, end);
    return NextResponse.json({ success: true, logs, startDate: start, endDate: end });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.date || !body.dayOfWeek) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: date, dayOfWeek' },
        { status: 400 }
      );
    }

    const log = saveDailyLog({
      date: body.date,
      dayOfWeek: body.dayOfWeek,
      totalBusinesses: Number(body.totalBusinesses || 0),
      ownerAbsent: Number(body.ownerAbsent || 0),
      declined: Number(body.declined || 0),
      accepted: Number(body.accepted || 0),
      revenue: Number(body.revenue || 0),
      prospectingHours: Number(body.prospectingHours || 0),
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
