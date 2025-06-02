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
import { OrderService } from "@/lib/services/order-service"

// Tipos para los pedidos (adaptados al formato real)
type OrderStatus = "pending" | "completed" | "cancelled"

interface OrderItem {
  id: string | number
  type: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  userId: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  paymentDetails: {
    cardNumber: string
    cardName: string
    cardExpiry: string
  }
  createdAt: string
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
      if (status !== "authenticated" || !session?.user?.email) return

      try {
        setIsLoading(true)
        
        // Cargar pedidos reales del localStorage para el usuario actual
        const userOrders = OrderService.getUserLocalOrders(session.user.email)
        
        // Intentar cargar también de la API si está disponible
        try {
          const apiOrders = await OrderService.getUserOrders()
          // Combinar pedidos locales y de API, evitando duplicados
          const allOrders = [...userOrders]
          apiOrders.forEach((apiOrder: any) => {
            const exists = allOrders.some(localOrder => localOrder.id === apiOrder.id)
            if (!exists) {
              allOrders.push(apiOrder)
            }
          })
          // Ordenar por fecha más reciente
          const sortedOrders = allOrders.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setOrders(sortedOrders)
          setFilteredOrders(sortedOrders)
        } catch (error) {
          console.log("No se pudieron cargar pedidos de la API, usando localStorage")
          // Ordenar pedidos locales por fecha
          const sortedOrders = userOrders.sort((a, b) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          setOrders(sortedOrders)
          setFilteredOrders(sortedOrders)
        }
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
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
    
    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      if (session?.user?.email) {
        const userOrders = OrderService.getUserLocalOrders(session.user.email)
        const sortedOrders = userOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        setOrders(sortedOrders)
        setFilteredOrders(sortedOrders)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [status, session, toast])

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
      case "pending":
        return "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
      case "completed":
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
      case "pending":
        return "En procesamiento"
      case "completed":
        return "Completado"
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
          >            <TabsList className="grid grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="all">Todos</TabsTrigger>
              <TabsTrigger value="pending">Procesando</TabsTrigger>
              <TabsTrigger value="completed">Completados</TabsTrigger>
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
              <CardHeader className="pb-4">                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                    <CardDescription>Realizado el {formatDate(order.createdAt)}</CardDescription>
                  </div>
                  <Badge className={`mt-2 sm:mt-0 ${getStatusColor(order.status)}`} variant="outline">
                    {getStatusText(order.status)}
                  </Badge>
                </div>
              </CardHeader>              <CardContent className="pb-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    {order.items.length} {order.items.length === 1 ? "producto" : "productos"} • Total: $
                    {order.total.toFixed(2)}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Estado:</span> {getStatusText(order.status)}
                  </div>
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
