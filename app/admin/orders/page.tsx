"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Search, Eye, Loader2, CheckCircle, Truck, Package, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { apiService, type Order } from "@/lib/api-service"

export default function AdminOrdersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date-desc")  // Verificar si el usuario es administrador
  useEffect(() => {
    if (status === "authenticated") {
      const userRole = (session as any)?.user?.role;
      if (userRole !== "admin") {
        toast({
          variant: "destructive",
          title: "Acceso denegado",
          description: "No tienes permisos para acceder a esta página.",
        })
        router.push("/")
      }
    } else if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, session, router, toast])

  // Inicializar datos de prueba
  useEffect(() => {
    apiService.init()
  }, [])  // Cargar pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      if (status !== "authenticated") return
      
      const userRole = (session as any)?.user?.role;
      if (userRole !== "admin") return

      try {
        setIsLoading(true)
        
        // Cargar pedidos de prueba de la API
        const apiOrders = await apiService.getOrders()
        
        // Cargar pedidos reales del localStorage
        const localStorageOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        
        // Transformar pedidos del localStorage al formato esperado
        const transformedLocalOrders = localStorageOrders.map((order: any) => ({
          id: order.id,
          userId: order.userId,
          userName: order.userId, // Como no tenemos el nombre, usamos el email
          userEmail: order.userId,
          date: order.createdAt, // Usar createdAt del localStorage
          status: order.status === 'completed' ? 'delivered' : order.status,
          total: order.total,
          items: order.items,
          shippingDetails: {
            name: order.paymentDetails?.cardName || "Cliente",
            email: order.userId,
            address: "Dirección no disponible",
            city: "Ciudad no disponible", 
            state: "Estado no disponible",
            postalCode: "00000",
            country: "Bolivia"
          }
        }))
        
        // Combinar ambas fuentes de datos
        const allOrders = [...apiOrders, ...transformedLocalOrders]
        
        setOrders(allOrders)
        setFilteredOrders(allOrders)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar pedidos",
          description: "No se pudieron cargar los pedidos. Inténtalo de nuevo más tarde.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [status, session, toast])

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      // Recargar pedidos cuando cambien en localStorage
      if (status === "authenticated" && session?.user?.email === "admin@example.com") {
        fetchOrders()
      }
    }

    const fetchOrders = async () => {
      try {
        // Cargar pedidos de prueba de la API
        const apiOrders = await apiService.getOrders()
        
        // Cargar pedidos reales del localStorage
        const localStorageOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        
        // Transformar pedidos del localStorage al formato esperado
        const transformedLocalOrders = localStorageOrders.map((order: any) => ({
          id: order.id,
          userId: order.userId,
          userName: order.userId,
          userEmail: order.userId,
          date: order.createdAt,
          status: order.status === 'completed' ? 'delivered' : order.status,
          total: order.total,
          items: order.items,
          shippingDetails: {
            name: order.paymentDetails?.cardName || "Cliente",
            email: order.userId,
            address: "Dirección no disponible",
            city: "Ciudad no disponible", 
            state: "Estado no disponible",
            postalCode: "00000",
            country: "Bolivia"
          }
        }))
        
        // Combinar ambas fuentes de datos
        const allOrders = [...apiOrders, ...transformedLocalOrders]
        
        setOrders(allOrders)
        setFilteredOrders(allOrders)
      } catch (error) {
        console.error('Error al recargar pedidos:', error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [status, session])

  // Filtrar y ordenar pedidos
  useEffect(() => {
    let filtered = [...orders]

    // Filtrar por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Ordenar pedidos
    switch (sortBy) {
      case "date-asc":
        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        break
      case "date-desc":
        filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        break
      case "total-asc":
        filtered.sort((a, b) => a.total - b.total)
        break
      case "total-desc":
        filtered.sort((a, b) => b.total - a.total)
        break
    }

    setFilteredOrders(filtered)
  }, [orders, statusFilter, searchTerm, sortBy])

  // Función para obtener el color de badge según estado
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processing":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20">
            <Package className="mr-1 h-3 w-3" />
            En procesamiento
          </Badge>
        )
      case "shipped":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20">
            <Truck className="mr-1 h-3 w-3" />
            Enviado
          </Badge>
        )
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 hover:bg-green-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Entregado
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 hover:bg-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelado
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        // Si la fecha no es válida, intentar parsearlo como timestamp
        const timestamp = parseInt(dateString)
        if (!isNaN(timestamp)) {
          return new Date(timestamp).toLocaleDateString("es", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        }
        return "Fecha inválida"
      }
      
      return date.toLocaleDateString("es", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch (error) {
      return "Fecha inválida"
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando pedidos...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Gestión de Pedidos</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filtros y búsqueda</CardTitle>
          <CardDescription>Filtra y busca pedidos por diferentes criterios</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por ID, cliente o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado del pedido" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="processing">En procesamiento</SelectItem>
                  <SelectItem value="shipped">Enviados</SelectItem>
                  <SelectItem value="delivered">Entregados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Fecha (más reciente)</SelectItem>
                  <SelectItem value="date-asc">Fecha (más antiguo)</SelectItem>
                  <SelectItem value="total-desc">Total (mayor a menor)</SelectItem>
                  <SelectItem value="total-asc">Total (menor a mayor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
          <CardDescription>
            {filteredOrders.length} {filteredOrders.length === 1 ? "pedido encontrado" : "pedidos encontrados"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Productos</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No se encontraron pedidos
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order, index) => (
                    <TableRow key={`${order.id}-${index}`}>  
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.userName}</div>
                          <div className="text-sm text-muted-foreground">{order.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right font-medium">${order.total.toFixed(2)}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{order.items.length}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/admin/orders/${order.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver detalles
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
