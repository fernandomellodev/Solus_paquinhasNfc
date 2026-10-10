import { NextRequest, NextResponse } from 'next/server';
import { getPlaqueByCode, recordFeedback } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, rating, comment, contactName, contactPhone } = body;

    if (!code || !rating) {
      return NextResponse.json({ success: false, error: 'Código e avaliação são obrigatórios' }, { status: 400 });
    }

    const plaque = getPlaqueByCode(code);
    if (!plaque) {
      return NextResponse.json({ success: false, error: 'Plaquinha não encontrada' }, { status: 404 });
    }

    recordFeedback(plaque.id, Number(rating), comment, contactName, contactPhone);

    return NextResponse.json({ success: true, message: 'Feedback gravado com sucesso' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
