interface Order {
  id: string
  userId: string
  items: Array<{
    id: string
    type: string
    name: string
    price: number
    quantity: number
  }>
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  paymentDetails: {
    cardNumber: string
    cardName: string
    cardExpiry: string
  }
  createdAt: string
}

export const OrderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'status' | 'createdAt'>) {
    // Crear el pedido localmente primero para asegurar que se guarde
    const localOrder: Order = {
      id: Date.now().toString(),
      userId: orderData.userId,
      items: orderData.items,
      total: orderData.total,
      status: 'completed',
      paymentDetails: orderData.paymentDetails,
      createdAt: new Date().toISOString()
    }

    // Guardar en localStorage inmediatamente
    this.saveOrderLocally(localOrder)

    try {
      // Intentar guardar en el servidor también
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()
      
      if (response.ok && data.order) {
        // Si el servidor respondió correctamente, actualizar con el ID del servidor
        const serverOrder = data.order
        this.updateLocalOrder(localOrder.id, serverOrder)
        return serverOrder
      }
    } catch (error) {
      console.log('Error al guardar en servidor, manteniendo pedido local:', error)
    }

    // Retornar el pedido local si el servidor falló
    return localOrder
  },

  // Método para guardar un pedido en localStorage
  saveOrderLocally(order: Order) {
    if (typeof window === 'undefined') return
    
    const existingOrders = this.getLocalOrders()
    const updatedOrders = [...existingOrders, order]
    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    
    // Disparar evento para notificar cambios
    window.dispatchEvent(new Event('storage'))
  },

  // Método para actualizar un pedido local con datos del servidor
  updateLocalOrder(localId: string, serverOrder: Order) {
    if (typeof window === 'undefined') return
    
    const orders = this.getLocalOrders()
    const orderIndex = orders.findIndex(order => order.id === localId)
    
    if (orderIndex !== -1) {
      orders[orderIndex] = serverOrder
      localStorage.setItem('orders', JSON.stringify(orders))
      window.dispatchEvent(new Event('storage'))
    }
  },

  async getUserOrders() {
    const response = await fetch('/api/orders')
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener los pedidos')
    }

    return data.orders
  },

  async getAdminOrders() {
    const response = await fetch('/api/orders?admin=true')
    const data = await response.json()
    
    if (!response.ok) {
      throw new Error(data.error || 'Error al obtener los pedidos')
    }

    return data.orders
  },

  // Método para obtener pedidos del localStorage
  getLocalOrders(): Order[] {
    if (typeof window === 'undefined') return []
    return JSON.parse(localStorage.getItem('orders') || '[]')
  },

  // Método para obtener pedidos de un usuario específico del localStorage
  getUserLocalOrders(userId: string): Order[] {
    const allOrders = this.getLocalOrders()
    return allOrders.filter(order => order.userId === userId)
  }
}
