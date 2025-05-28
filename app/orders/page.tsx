"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Package, ChevronRight, Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Tipos para los pedidos
type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled"

interface OrderItem {
  id: string | number
  type: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  date: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  trackingNumber?: string
}

export default function OrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all")
  const [isLoading, setIsLoading] = useState(true)

  // Redirigir si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Cargar pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== "authenticated") return

      try {
        setIsLoading(true)
        // En un entorno real, esto sería una llamada a la API
        // const response = await api.get("/api/orders")
        // setOrders(response.data)

        // Simular un retraso para mostrar el estado de carga
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Datos de ejemplo
        const mockOrders: Order[] = [
          {
            id: "ORD-123456",
            date: "2023-05-15T10:30:00Z",
            status: "delivered",
            total: 1299.99,
            items: [
              { id: 1, type: "cpu", name: "Intel Core i7-13700K", price: 409.99, quantity: 1 },
              { id: 2, type: "motherboard", name: "MSI MPG Z790 Gaming Edge WiFi", price: 369.99, quantity: 1 },
              { id: 3, type: "ram", name: "Corsair Vengeance RGB Pro 32GB", price: 129.99, quantity: 1 },
              { id: 4, type: "gpu", name: "NVIDIA GeForce RTX 4070 Ti", price: 799.99, quantity: 1 },
            ],
            trackingNumber: "TRK-987654321",
          },
          {
            id: "ORD-789012",
            date: "2023-06-22T14:45:00Z",
            status: "shipped",
            total: 899.99,
            items: [
              { id: 5, type: "cpu", name: "AMD Ryzen 7 7700X", price: 399.99, quantity: 1 },
              { id: 6, type: "motherboard", name: "Gigabyte B650 AORUS Elite AX", price: 259.99, quantity: 1 },
              { id: 7, type: "ram", name: "G.Skill Trident Z5 RGB 32GB", price: 179.99, quantity: 1 },
            ],
            trackingNumber: "TRK-123456789",
          },
          {
            id: "ORD-345678",
            date: "2023-07-10T09:15:00Z",
            status: "processing",
            total: 499.99,
            items: [{ id: 8, type: "gpu", name: "AMD Radeon RX 7800 XT", price: 499.99, quantity: 1 }],
          },
        ]

        setOrders(mockOrders)
        setFilteredOrders(mockOrders)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar pedidos",
          description: "No se pudieron cargar tus pedidos. Inténtalo de nuevo más tarde.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [status, toast])

  // Filtrar pedidos por búsqueda y estado
  useEffect(() => {
    let filtered = orders

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.items.some((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Filtrar por estado
    if (activeTab !== "all") {
      filtered = filtered.filter((order) => order.status === activeTab)
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, activeTab])

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // Función para obtener color de badge según estado
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "shipped":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "delivered":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      default:
        return ""
    }
  }

  // Función para obtener texto de estado
  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return "En procesamiento"
      case "shipped":
        return "Enviado"
      case "delivered":
        return "Entregado"
      case "cancelled":
        return "Cancelado"
      default:
        return ""
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando tus pedidos...</p>
      </div>
    )
  }

  if (orders.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No tienes pedidos</h2>
              <p className="text-muted-foreground mb-6">Aún no has realizado ningún pedido con nosotros</p>
              <Button asChild>
                <Link href="/wizard">Comenzar a armar mi PC</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Mis pedidos</h1>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por número de pedido o producto"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as OrderStatus | "all")}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="processing">Procesando</TabsTrigger>
              <TabsTrigger value="shipped">Enviados</TabsTrigger>
              <TabsTrigger value="delivered">Entregados</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelados</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-8">
            <CardContent>
              <p className="text-muted-foreground">No se encontraron pedidos que coincidan con tu búsqueda</p>
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Pedido {order.id}</CardTitle>
                    <CardDescription>Realizado el {formatDate(order.date)}</CardDescription>
                  </div>
                  <Badge className={`mt-2 sm:mt-0 ${getStatusColor(order.status)}`} variant="outline">
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "producto" : "productos"} • Total: $
                    {order.total.toFixed(2)}
                  </div>
                  {order.trackingNumber && (
                    <div className="text-sm">
                      <span className="font-medium">Número de seguimiento:</span> {order.trackingNumber}
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end border-t pt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/orders/${order.id}`}>
                    Ver detalles
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
