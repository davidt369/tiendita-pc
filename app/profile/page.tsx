"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { User, Mail, Calendar, Shield, Loader2, Package, Search, Eye } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { OrderService } from "@/lib/services/order-service"

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

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [exchangeRate, setExchangeRate] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isLoadingOrders, setIsLoadingOrders] = useState(true)

  // Redirigir si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  useEffect(() => {    const loadData = async () => {
      if (session?.user?.email) {
        try {
          setIsLoadingOrders(true)
          
          // Cargar pedidos del localStorage para el usuario actual
          const userOrders = OrderService.getUserLocalOrders(session.user.email)
          setOrders(userOrders)
          
          // Intentar cargar de la API también y combinar
          try {
            const apiOrders = await OrderService.getUserOrders()
            // Combinar pedidos locales y de API, evitando duplicados
            const allOrders = [...userOrders]
            apiOrders.forEach((apiOrder: Order) => {
              const exists = allOrders.some(localOrder => localOrder.id === apiOrder.id)
              if (!exists) {
                allOrders.push(apiOrder)
              }
            })
            setOrders(allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
          } catch (error) {
            console.log("No se pudieron cargar pedidos de la API, usando localStorage")
            // Ordenar pedidos locales por fecha
            setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
          }
        } catch (error) {
          console.error('Error al cargar pedidos:', error)
        } finally {
          setIsLoadingOrders(false)
        }
      }
    }

    const rate = localStorage.getItem('exchangeRate')
    if (rate) {
      setExchangeRate(parseFloat(rate))
    }

    // Escuchar cambios en el tipo de cambio
    const handleExchangeRateChange = () => {
      const newRate = localStorage.getItem('exchangeRate')
      if (newRate) {
        setExchangeRate(parseFloat(newRate))
      }
    }    // Escuchar cambios en los pedidos
    const handleOrdersChange = () => {
      if (session?.user?.email) {
        const userOrders = OrderService.getUserLocalOrders(session.user.email)
        setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      }
    }

    window.addEventListener('exchangeRateChanged', handleExchangeRateChange)
    window.addEventListener('storage', handleOrdersChange)
    
    loadData()

    return () => {
      window.removeEventListener('exchangeRateChanged', handleExchangeRateChange)
      window.removeEventListener('storage', handleOrdersChange)
    }
  }, [session])

  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Si la fecha no es válida, intentar parsearlo como timestamp
        const timestamp = parseInt(dateString)
        if (!isNaN(timestamp)) {
          return new Date(timestamp).toLocaleDateString("es", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        }
        return "Fecha inválida"
      }
      
      return date.toLocaleDateString("es", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch (error) {
      return "Fecha inválida"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: "Completado", variant: "default" as const },
      pending: { label: "Procesando", variant: "secondary" as const },
      cancelled: { label: "Cancelado", variant: "destructive" as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === "" || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (status === "loading") {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando perfil...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>
      
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Información Personal</TabsTrigger>
          <TabsTrigger value="orders">Mis Pedidos ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Información Personal
              </CardTitle>
              <CardDescription>
                Administra tu información de perfil y configuración de cuenta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={session.user?.image || ""} alt={session.user?.name || "Usuario"} />
                  <AvatarFallback className="text-lg">
                    {getUserInitials(session.user?.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold">{session.user?.name || "Usuario"}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{session.user?.email}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mis Pedidos
                </CardTitle>
                <CardDescription>
                  Historial completo de tus pedidos realizados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por número de pedido o producto..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pending">Procesando</SelectItem>
                      <SelectItem value="completed">Completados</SelectItem>
                      <SelectItem value="cancelled">Cancelados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isLoadingOrders ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Cargando pedidos...</span>
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium">
                      {searchTerm || statusFilter !== "all" 
                        ? "No se encontraron pedidos" 
                        : "No tienes pedidos realizados"}
                    </p>
                    <p className="text-muted-foreground">
                      {searchTerm || statusFilter !== "all" 
                        ? "Intenta cambiar los filtros de búsqueda" 
                        : "Cuando realices tu primera compra, aparecerá aquí"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold">Pedido #{order.id}</h3>
                                {getStatusBadge(order.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Realizado el {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                              {exchangeRate && (
                                <p className="text-sm text-green-600">
                                  {(order.total * exchangeRate).toFixed(2)} Bs
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium">
                              {order.items.length} producto{order.items.length !== 1 ? 's' : ''}
                            </p>
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  {item.quantity}x {item.name}
                                </span>
                                <span>${(item.price * item.quantity).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-4 border-t">
                            <p className="text-sm text-muted-foreground">
                              Pagado con tarjeta terminada en ****{order.paymentDetails.cardNumber.slice(-4)}
                            </p>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
