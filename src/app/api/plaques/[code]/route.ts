import { NextRequest, NextResponse } from 'next/server';
import { getPlaqueByCode, createOrUpdatePlaque, deletePlaque } from '@/lib/db';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const plaque = getPlaqueByCode(code);

    if (!plaque) {
      return NextResponse.json({ success: false, error: 'Plaquinha não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, plaque });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const body = await req.json();

    const updated = createOrUpdatePlaque({
      code,
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

    return NextResponse.json({ success: true, plaque: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const plaque = getPlaqueByCode(code);

    if (!plaque) {
      return NextResponse.json({ success: false, error: 'Plaquinha não encontrada' }, { status: 404 });
    }

    deletePlaque(plaque.id);
    return NextResponse.json({ success: true, message: 'Plaquinha excluída com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
