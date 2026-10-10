import { NextRequest, NextResponse } from 'next/server';
import { getAllPlaques, createOrUpdatePlaque, createBatchPlaques } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;

    const plaques = getAllPlaques(status, search);
    return NextResponse.json({ success: true, plaques });
  } catch (error: any) {
    console.error('Error fetching plaques:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Se for criação em lote
    if (body.type === 'BATCH') {
      const count = Number(body.count) || 10;
      const prefix = body.prefix !== undefined ? body.prefix : 'PLQ';
      const batchTag = body.batchTag || undefined;

      const created = createBatchPlaques(count, prefix, batchTag);
      return NextResponse.json({ success: true, count: created.length, plaques: created });
    }

    // Cadastro individual ou ativação rápida
    if (!body.code) {
      return NextResponse.json({ success: false, error: 'Código da plaquinha é obrigatório' }, { status: 400 });
    }

    const plaque = createOrUpdatePlaque({
      code: body.code,
      title: body.title,
      googleReviewUrl: body.googleReviewUrl,
      placeName: body.placeName,
      status: body.status,
      feedbackGate: body.feedbackGate,
      clientPhone: body.clientPhone,
      clientEmail: body.clientEmail,
      notes: body.notes,
      batchTag: body.batchTag,
    });

    return NextResponse.json({ success: true, plaque });
  } catch (error: any) {
    console.error('Error saving plaque:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
