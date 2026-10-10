import { NextRequest, NextResponse } from 'next/server';
import { getAllSales, createSale, updateSale, deleteSale } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const search = searchParams.get('search') || undefined;

    const sales = getAllSales(startDate, endDate, search);
    return NextResponse.json({ success: true, sales });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.clientName || !body.saleDate || body.amount === undefined || !body.itemSold) {
      return NextResponse.json(
        { success: false, error: 'Campos obrigatórios: clientName, saleDate, amount, itemSold' },
        { status: 400 }
      );
    }

    const sale = createSale({
      clientName: body.clientName,
      saleDate: body.saleDate,
      deliveryDate: body.deliveryDate || null,
      amount: Number(body.amount),
      itemSold: body.itemSold,
      status: body.status || 'CONCLUIDA',
      paymentMethod: body.paymentMethod || null,
      notes: body.notes || null,
    });

    return NextResponse.json({ success: true, sale }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });
    }

    const updated = updateSale(body.id, {
      clientName: body.clientName,
      saleDate: body.saleDate,
      deliveryDate: body.deliveryDate,
      amount: body.amount !== undefined ? Number(body.amount) : undefined,
      itemSold: body.itemSold,
      status: body.status,
      paymentMethod: body.paymentMethod,
      notes: body.notes,
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: 'Venda não encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, sale: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'ID é obrigatório' }, { status: 400 });
    }

    const success = deleteSale(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
