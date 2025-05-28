// Servicio para simular llamadas a API con datos de prueba y localStorage
import { mockData } from "@/lib/mock-data"
import type { SavedBuild } from "@/lib/types"

// Tipos para la API
export interface User {
  id: string
  name: string
  email: string
  image?: string
  role: "admin" | "user"
  createdAt: string
}

export interface Product {
  id: number
  nombre: string
  precio: number
  imagen_url?: string
  tipo: string
  marca: string
  stock: number
  descripcion: string
  especificaciones: Record<string, any>
  valoracion: number
  opiniones: number
  [key: string]: any
}

export interface Order {
  id: string
  userId: string
  userName: string
  userEmail: string
  date: string
  status: "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: {
    id: number | string
    type: string
    name: string
    price: number
    quantity: number
    image?: string
  }[]
  shippingDetails: {
    name: string
    email: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  trackingNumber?: string
  estimatedDelivery?: string
}

// Función para generar datos de prueba
const generateMockData = () => {
  // Convertir los datos de mockData a un array de productos
  const products: Product[] = [
    ...mockData.cpu.map((item) => ({
      ...item,
      tipo: "cpu",
      marca: ["Intel", "AMD"][Math.floor(Math.random() * 2)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Procesador de alto rendimiento para gaming y tareas exigentes.",
      especificaciones: {
        Modelo: item.nombre,
        Socket: item.socket,
        Núcleos: Math.floor(Math.random() * 16) + 4,
        Hilos: Math.floor(Math.random() * 32) + 8,
        "Frecuencia base": `${(Math.random() * 2 + 2).toFixed(1)} GHz`,
        "Frecuencia turbo": `${(Math.random() * 2 + 4).toFixed(1)} GHz`,
        TDP: `${Math.floor(Math.random() * 50) + 65}W`,
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
    ...mockData.gpu.map((item) => ({
      ...item,
      tipo: "gpu",
      marca: ["NVIDIA", "AMD", "ASUS", "MSI", "Gigabyte"][Math.floor(Math.random() * 5)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Tarjeta gráfica potente para gaming y diseño gráfico.",
      especificaciones: {
        Modelo: item.nombre,
        Memoria: `${Math.floor(Math.random() * 8) + 8}GB GDDR6`,
        "Bus de memoria": `${Math.floor(Math.random() * 128) + 128}-bit`,
        Frecuencia: `${Math.floor(Math.random() * 500) + 1500} MHz`,
        "CUDA Cores": Math.floor(Math.random() * 4000) + 4000,
        Consumo: `${item.watts}W`,
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
    ...mockData.ram.map((item) => ({
      ...item,
      tipo: "ram",
      marca: ["Corsair", "G.Skill", "Kingston", "Crucial"][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Memoria RAM de alta velocidad para un rendimiento óptimo.",
      especificaciones: {
        Modelo: item.nombre,
        Tipo: item.tipo_memoria,
        Capacidad: `${item.capacidad_gb}GB`,
        Velocidad: `${Math.floor(Math.random() * 1600) + 3200} MHz`,
        "CAS Latency": `CL${Math.floor(Math.random() * 10) + 14}`,
        Voltaje: `${(Math.random() * 0.6 + 1.2).toFixed(2)}V`,
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
    ...mockData.placa_madre.map((item) => ({
      ...item,
      tipo: "motherboard",
      marca: ["ASUS", "MSI", "Gigabyte", "ASRock"][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Placa madre con características avanzadas para tu PC.",
      especificaciones: {
        Modelo: item.nombre,
        Socket: item.socket,
        Chipset: ["Z790", "B760", "X670", "B650"][Math.floor(Math.random() * 4)],
        "Tipo de memoria": item.tipo_memoria,
        "Slots de memoria": Math.floor(Math.random() * 2) + 2,
        "Puertos SATA": Math.floor(Math.random() * 4) + 4,
        "Puertos M.2": Math.floor(Math.random() * 2) + 1,
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
    ...mockData.almacenamiento.map((item) => ({
      ...item,
      tipo: "storage",
      marca: ["Samsung", "Western Digital", "Crucial", "Seagate"][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Almacenamiento rápido y confiable para tus datos.",
      especificaciones: {
        Modelo: item.nombre,
        Tipo: item.tipo,
        Capacidad: `${item.capacidad_gb}GB`,
        "Velocidad de lectura": `${Math.floor(Math.random() * 2000) + 2000} MB/s`,
        "Velocidad de escritura": `${Math.floor(Math.random() * 1500) + 1500} MB/s`,
        Interfaz: item.tipo === "NVMe" ? "PCIe 4.0 x4" : item.tipo === "SSD" ? "SATA III" : "SATA III",
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
    ...mockData.fuente.map((item) => ({
      ...item,
      tipo: "psu",
      marca: ["Corsair", "EVGA", "Seasonic", "be quiet!"][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Fuente de poder confiable y eficiente para tu sistema.",
      especificaciones: {
        Modelo: item.nombre,
        Potencia: `${item.watts}W`,
        Eficiencia: item.eficiencia,
        Modular: ["No", "Semi", "Completo"][Math.floor(Math.random() * 3)],
        "Certificación 80 PLUS": item.eficiencia.split(" ")[1],
        Protecciones: "OVP, UVP, OCP, OPP, SCP",
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
    ...mockData.gabinete.map((item) => ({
      ...item,
      tipo: "case",
      marca: ["Corsair", "NZXT", "Fractal Design", "Lian Li"][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Gabinete elegante y funcional para tu PC.",
      especificaciones: {
        Modelo: item.nombre,
        "Factor de forma": item.formato_compatible,
        "Espacio máximo GPU": `${item.max_gpu_mm}mm`,
        'Bahías de 3.5"': Math.floor(Math.random() * 4) + 2,
        'Bahías de 2.5"': Math.floor(Math.random() * 4) + 2,
        "Puertos frontales": "USB 3.0 x2, USB-C x1, Audio/Mic",
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
    ...mockData.perifericos.map((item) => ({
      ...item,
      tipo: "peripheral",
      marca: ["Logitech", "Razer", "SteelSeries", "HyperX"][Math.floor(Math.random() * 4)],
      stock: Math.floor(Math.random() * 50) + 1,
      descripcion: "Periférico de alta calidad para mejorar tu experiencia.",
      especificaciones: {
        Modelo: item.nombre,
        Tipo: item.tipo,
        Conectividad: ["Cableado", "Inalámbrico"][Math.floor(Math.random() * 2)],
        "Tiempo de respuesta": `${Math.floor(Math.random() * 10) + 1}ms`,
        Características: item.especificaciones || "N/A",
      },
      valoracion: (Math.random() * 2 + 3).toFixed(1),
      opiniones: Math.floor(Math.random() * 100) + 10,
    })),
  ]

  // Generar usuarios de prueba
  const users: User[] = [
    {
      id: "1",
      name: "Admin User",
      email: "admin@example.com",
      image: "/placeholder.svg?height=200&width=200",
      role: "admin",
      createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "2",
      name: "Test User",
      email: "user@example.com",
      image: "/placeholder.svg?height=200&width=200",
      role: "user",
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      name: "María García",
      email: "maria@example.com",
      image: "/placeholder.svg?height=200&width=200",
      role: "user",
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      name: "Carlos Rodríguez",
      email: "carlos@example.com",
      image: "/placeholder.svg?height=200&width=200",
      role: "user",
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "5",
      name: "Ana Martínez",
      email: "ana@example.com",
      image: "/placeholder.svg?height=200&width=200",
      role: "user",
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Generar pedidos de prueba
  const orders: Order[] = [
    {
      id: "ORD-123456",
      userId: "2",
      userName: "Test User",
      userEmail: "user@example.com",
      date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
      status: "delivered",
      total: 1299.99,
      items: [
        {
          id: 1,
          type: "cpu",
          name: "Intel Core i7-13700K",
          price: 409.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 2,
          type: "motherboard",
          name: "MSI MPG Z790 Gaming Edge WiFi",
          price: 369.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 3,
          type: "ram",
          name: "Corsair Vengeance RGB Pro 32GB",
          price: 129.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 4,
          type: "gpu",
          name: "NVIDIA GeForce RTX 4070 Ti",
          price: 799.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
      shippingDetails: {
        name: "Test User",
        email: "user@example.com",
        address: "Calle Principal 123",
        city: "Ciudad de México",
        state: "CDMX",
        postalCode: "01000",
        country: "México",
      },
      trackingNumber: "TRK-987654321",
      estimatedDelivery: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ORD-789012",
      userId: "3",
      userName: "María García",
      userEmail: "maria@example.com",
      date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: "shipped",
      total: 899.99,
      items: [
        {
          id: 5,
          type: "cpu",
          name: "AMD Ryzen 7 7700X",
          price: 399.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 6,
          type: "motherboard",
          name: "Gigabyte B650 AORUS Elite AX",
          price: 259.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 7,
          type: "ram",
          name: "G.Skill Trident Z5 RGB 32GB",
          price: 179.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
      shippingDetails: {
        name: "María García",
        email: "maria@example.com",
        address: "Avenida Reforma 456",
        city: "Guadalajara",
        state: "Jalisco",
        postalCode: "44100",
        country: "México",
      },
      trackingNumber: "TRK-123456789",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ORD-345678",
      userId: "4",
      userName: "Carlos Rodríguez",
      userEmail: "carlos@example.com",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      status: "processing",
      total: 499.99,
      items: [
        {
          id: 8,
          type: "gpu",
          name: "AMD Radeon RX 7800 XT",
          price: 499.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
      shippingDetails: {
        name: "Carlos Rodríguez",
        email: "carlos@example.com",
        address: "Calle Juárez 789",
        city: "Monterrey",
        state: "Nuevo León",
        postalCode: "64000",
        country: "México",
      },
      estimatedDelivery: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "ORD-567890",
      userId: "5",
      userName: "Ana Martínez",
      userEmail: "ana@example.com",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      status: "cancelled",
      total: 1599.99,
      items: [
        {
          id: 1,
          type: "cpu",
          name: "Intel Core i9-13900K",
          price: 599.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
        {
          id: 2,
          type: "gpu",
          name: "NVIDIA GeForce RTX 4090",
          price: 1599.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
      shippingDetails: {
        name: "Ana Martínez",
        email: "ana@example.com",
        address: "Avenida Insurgentes 1010",
        city: "Ciudad de México",
        state: "CDMX",
        postalCode: "03100",
        country: "México",
      },
    },
    {
      id: "ORD-901234",
      userId: "2",
      userName: "Test User",
      userEmail: "user@example.com",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: "processing",
      total: 799.99,
      items: [
        {
          id: 3,
          type: "gpu",
          name: "NVIDIA GeForce RTX 4070 Ti",
          price: 799.99,
          quantity: 1,
          image: "/placeholder.svg?height=80&width=80",
        },
      ],
      shippingDetails: {
        name: "Test User",
        email: "user@example.com",
        address: "Calle Principal 123",
        city: "Ciudad de México",
        state: "CDMX",
        postalCode: "01000",
        country: "México",
      },
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return { products, users, orders }
}

// Inicializar datos en localStorage si no existen
const initializeLocalStorage = () => {
  if (typeof window === "undefined") return

  const { products, users, orders } = generateMockData()

  // Siempre inicializar productos para asegurar que haya datos
  localStorage.setItem("products", JSON.stringify(products))

  if (!localStorage.getItem("users")) {
    localStorage.setItem("users", JSON.stringify(users))
  }

  if (!localStorage.getItem("orders")) {
    localStorage.setItem("orders", JSON.stringify(orders))
  }

  if (!localStorage.getItem("savedBuilds")) {
    localStorage.setItem("savedBuilds", JSON.stringify([]))
  }

  // Devolver los productos para uso inmediato
  return products
}

// Servicio de API simulado
export const apiService = {
  // Inicializar datos
  init: () => {
    initializeLocalStorage()
  },

  // Productos
  getProducts: async (): Promise<Product[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return []

    // Inicializar si no hay datos
    let products = JSON.parse(localStorage.getItem("products") || "[]")

    // Si no hay productos, inicializar y obtener
    if (!products || products.length === 0) {
      const { products: newProducts } = generateMockData()
      localStorage.setItem("products", JSON.stringify(newProducts))
      products = newProducts
    }

    return products
  },

  getProductById: async (type: string, id: number): Promise<Product | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return null
    const products: Product[] = JSON.parse(localStorage.getItem("products") || "[]")
    return products.find((p) => p.tipo === type && p.id === id) || null
  },

  updateProduct: async (product: Product): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return product
    const products: Product[] = JSON.parse(localStorage.getItem("products") || "[]")
    const index = products.findIndex((p) => p.tipo === product.tipo && p.id === product.id)
    if (index !== -1) {
      products[index] = product
      localStorage.setItem("products", JSON.stringify(products))
    }
    return product
  },

  createProduct: async (product: Omit<Product, "id">): Promise<Product> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return { ...product, id: 0 } as Product
    const products: Product[] = JSON.parse(localStorage.getItem("products") || "[]")
    const newId = Math.max(...products.map((p) => p.id), 0) + 1
    const newProduct = { ...product, id: newId } as Product
    products.push(newProduct)
    localStorage.setItem("products", JSON.stringify(products))
    return newProduct
  },

  deleteProduct: async (type: string, id: number): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return false
    const products: Product[] = JSON.parse(localStorage.getItem("products") || "[]")
    const filteredProducts = products.filter((p) => !(p.tipo === type && p.id === id))
    localStorage.setItem("products", JSON.stringify(filteredProducts))
    return true
  },

  // Usuarios
  getUsers: async (): Promise<User[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("users") || "[]")
  },

  getUserById: async (id: string): Promise<User | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return null
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    return users.find((u) => u.id === id) || null
  },

  updateUser: async (user: User): Promise<User> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return user
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    const index = users.findIndex((u) => u.id === user.id)
    if (index !== -1) {
      users[index] = user
      localStorage.setItem("users", JSON.stringify(users))
    }
    return user
  },

  deleteUser: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return false
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")
    const filteredUsers = users.filter((u) => u.id !== id)
    localStorage.setItem("users", JSON.stringify(filteredUsers))
    return true
  },

  // Pedidos
  getOrders: async (): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("orders") || "[]")
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return null
    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]")
    return orders.find((o) => o.id === id) || null
  },

  getOrdersByUserId: async (userId: string): Promise<Order[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return []
    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]")
    return orders.filter((o) => o.userId === userId)
  },

  createOrder: async (order: Omit<Order, "id">): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return { ...order, id: "ORD-000000" } as Order
    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]")
    const newId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`
    const newOrder = { ...order, id: newId } as Order
    orders.push(newOrder)
    localStorage.setItem("orders", JSON.stringify(orders))
    return newOrder
  },

  updateOrder: async (order: Order): Promise<Order> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return order
    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]")
    const index = orders.findIndex((o) => o.id === order.id)
    if (index !== -1) {
      orders[index] = order
      localStorage.setItem("orders", JSON.stringify(orders))
    }
    return order
  },

  deleteOrder: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined") return false
    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]")
    const filteredOrders = orders.filter((o) => o.id !== id)
    localStorage.setItem("orders", JSON.stringify(filteredOrders))
    return true
  },

  // Configuraciones guardadas
  getSavedBuilds: async (): Promise<SavedBuild[]> => {
    await new Promise((resolve) => setTimeout(resolve, 100)) // Simular latencia
    if (typeof window === "undefined") return []
    return JSON.parse(localStorage.getItem("savedBuilds") || "[]")
  },

  saveBuild: async (build: Omit<SavedBuild, "id" | "date">): Promise<SavedBuild> => {
    await new Promise((resolve) => setTimeout(resolve, 100)) // Simular latencia
    if (typeof window === "undefined") return { ...build, id: "0", date: new Date().toISOString() }
    const savedBuilds: SavedBuild[] = JSON.parse(localStorage.getItem("savedBuilds") || "[]")
    const newBuild: SavedBuild = {
      ...build,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    }
    savedBuilds.push(newBuild)
    localStorage.setItem("savedBuilds", JSON.stringify(savedBuilds))
    return newBuild
  },

  updateSavedBuild: async (build: SavedBuild): Promise<SavedBuild> => {
    await new Promise((resolve) => setTimeout(resolve, 100)) // Simular latencia
    if (typeof window === "undefined") return build
    const savedBuilds: SavedBuild[] = JSON.parse(localStorage.getItem("savedBuilds") || "[]")
    const index = savedBuilds.findIndex((b) => b.id === build.id)
    if (index !== -1) {
      savedBuilds[index] = build
      localStorage.setItem("savedBuilds", JSON.stringify(savedBuilds))
    }
    return build
  },

  deleteSavedBuild: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 100)) // Simular latencia
    if (typeof window === "undefined") return false
    const savedBuilds: SavedBuild[] = JSON.parse(localStorage.getItem("savedBuilds") || "[]")
    const filteredBuilds = savedBuilds.filter((b) => b.id !== id)
    localStorage.setItem("savedBuilds", JSON.stringify(filteredBuilds))
    return true
  },

  // Estadísticas para el dashboard
  getDashboardStats: async (): Promise<{
    totalSales: number
    totalOrders: number
    totalUsers: number
    averageOrderValue: number
    salesByMonth: { month: string; sales: number }[]
    ordersByStatus: { processing: number; shipped: number; delivered: number; cancelled: number }
    topProducts: { name: string; sales: number }[]
  }> => {
    await new Promise((resolve) => setTimeout(resolve, 500)) // Simular latencia
    if (typeof window === "undefined")
      return {
        totalSales: 0,
        totalOrders: 0,
        totalUsers: 0,
        averageOrderValue: 0,
        salesByMonth: [],
        ordersByStatus: { processing: 0, shipped: 0, delivered: 0, cancelled: 0 },
        topProducts: [],
      }

    const orders: Order[] = JSON.parse(localStorage.getItem("orders") || "[]")
    const users: User[] = JSON.parse(localStorage.getItem("users") || "[]")

    // Calcular estadísticas
    const totalSales = orders.reduce((sum, order) => sum + order.total, 0)
    const totalOrders = orders.length
    const totalUsers = users.length
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0

    // Ventas por mes (últimos 12 meses)
    const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
    const salesByMonth = months.map((month, index) => {
      const sales = Math.floor(Math.random() * 3000) + 1000 // Datos aleatorios para demostración
      return { month, sales }
    })

    // Pedidos por estado
    const ordersByStatus = {
      processing: orders.filter((o) => o.status === "processing").length,
      shipped: orders.filter((o) => o.status === "shipped").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    }

    // Productos más vendidos
    const topProducts = [
      { name: "NVIDIA GeForce RTX 4070 Ti", sales: 28 },
      { name: "Intel Core i7-13700K", sales: 24 },
      { name: "AMD Ryzen 7 7700X", sales: 22 },
      { name: "Corsair Vengeance RGB Pro 32GB", sales: 19 },
      { name: "MSI MPG Z790 Gaming Edge WiFi", sales: 17 },
    ]

    return {
      totalSales,
      totalOrders,
      totalUsers,
      averageOrderValue,
      salesByMonth,
      ordersByStatus,
      topProducts,
    }
  },
}
