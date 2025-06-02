import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

let orders: any[] = []

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const data = await req.json()
    const order = {
      id: Date.now().toString(),
      userId: session.user.email,
      ...data,
      status: 'completed',
      createdAt: new Date().toISOString()
    }

    orders.push(order)

    // Retornamos el script para guardar en localStorage del cliente
    return NextResponse.json({ 
      success: true, 
      order,
      script: `
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(${JSON.stringify(order)});
        localStorage.setItem('orders', JSON.stringify(orders));
      `
    })
  } catch (error: any) {
    console.error('Error al crear orden:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pedido' },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const isAdmin = searchParams.get('admin') === 'true'
    const userEmail = session.user.email

    // Filtrar órdenes según el rol
    let filteredOrders = isAdmin 
      ? orders 
      : orders.filter(order => order.userId === userEmail)

    return NextResponse.json({ orders: filteredOrders })
  } catch (error: any) {
    console.error('Error al obtener órdenes:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener los pedidos' },
      { status: 500 }
    )
  }
}
