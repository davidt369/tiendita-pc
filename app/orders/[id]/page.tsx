"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowLeft, Package, Truck, CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"

// Tipos para los pedidos
type OrderStatus = "processing" | "shipped" | "delivered" | "cancelled"

interface OrderItem {
  id: string | number
  type: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface ShippingDetails {
  name: string
  email: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
}

interface Order {
  id: string
  date: string
  status: OrderStatus
  total: number
  items: OrderItem[]
  shippingDetails: ShippingDetails
  trackingNumber?: string
  estimatedDelivery?: string
}

export default function OrderDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Redirigir si no hay sesión
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login")
    }
  }, [status, router])

  // Cargar detalles del pedido
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (status !== "authenticated" || !id) return

      try {
        setIsLoading(true)
        // En un entorno real, esto sería una llamada a la API
        // const response = await api.get(`/api/orders/${id}`)
        // setOrder(response.data)

        // Simular un retraso para mostrar el estado de carga
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Datos de ejemplo
        if (id === "ORD-123456") {
          setOrder({
            id: "ORD-123456",
            date: "2023-05-15T10:30:00Z",
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
              name: "Juan Pérez",
              email: "juan@example.com",
              address: "Calle Principal 123",
              city: "Ciudad de México",
              state: "CDMX",
              postalCode: "01000",
              country: "México",
            },
            trackingNumber: "TRK-987654321",
            estimatedDelivery: "2023-05-20T00:00:00Z",
          })
        } else if (id === "ORD-789012") {
          setOrder({
            id: "ORD-789012",
            date: "2023-06-22T14:45:00Z",
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
            estimatedDelivery: "2023-06-28T00:00:00Z",
          })
        } else if (id === "ORD-345678") {
          setOrder({
            id: "ORD-345678",
            date: "2023-07-10T09:15:00Z",
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
            estimatedDelivery: "2023-07-17T00:00:00Z",
          })
        } else {
          // Si no se encuentra el pedido, redirigir a la página de pedidos
          toast({
            variant: "destructive",
            title: "Pedido no encontrado",
            description: "El pedido que buscas no existe o no tienes acceso a él.",
          })
          router.push("/orders")
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar el pedido",
          description: "No se pudo cargar la información del pedido. Inténtalo de nuevo más tarde.",
        })
        router.push("/orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id, status, router, toast])

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

  // Función para obtener icono de estado
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <AlertCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Cargando detalles del pedido...</p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="container mx-auto py-16 px-4">
        <Button asChild variant="outline" className="mb-8">
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a mis pedidos
          </Link>
        </Button>

        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Pedido no encontrado</h2>
              <p className="text-muted-foreground mb-6">El pedido que buscas no existe o no tienes acceso a él</p>
              <Button asChild>
                <Link href="/orders">Ver mis pedidos</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <Button asChild variant="outline" className="mb-8">
        <Link href="/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a mis pedidos
        </Link>
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Pedido {order.id}</CardTitle>
                  <CardDescription>Realizado el {formatDate(order.date)}</CardDescription>
                </div>
                <Badge className={`mt-2 sm:mt-0 ${getStatusColor(order.status)}`} variant="outline">
                  <span className="flex items-center">
                    {getStatusIcon(order.status)}
                    <span className="ml-1">{getStatusText(order.status)}</span>
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.trackingNumber && (
                  <div className="p-4 rounded-lg bg-muted">
                    <h3 className="font-medium mb-2">Información de envío</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Número de seguimiento:</span>
                        <span className="font-medium">{order.trackingNumber}</span>
                      </div>
                      {order.estimatedDelivery && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Entrega estimada:</span>
                          <span className="font-medium">{formatDate(order.estimatedDelivery)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-medium mb-4">Productos</h3>
                  <div className="divide-y">
                    {order.items.map((item) => (
                      <div key={`${item.type}-${item.id}`} className="flex py-4">
                        <div className="h-20 w-20 relative flex-shrink-0 mr-4">
                          <Image
                            src={item.image || "/placeholder.svg?height=80&width=80"}
                            alt={item.name}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground mb-1">Tipo: {item.type}</p>
                          <div className="flex justify-between">
                            <span className="text-sm">Cantidad: {item.quantity}</span>
                            <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dirección de envío</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <p className="font-medium">{order.shippingDetails.name}</p>
                <p>{order.shippingDetails.address}</p>
                <p>
                  {order.shippingDetails.city}, {order.shippingDetails.state} {order.shippingDetails.postalCode}
                </p>
                <p>{order.shippingDetails.country}</p>
                <p className="text-muted-foreground">{order.shippingDetails.email}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span>${(order.total * 0.16).toFixed(2)}</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>${(order.total + 10 + order.total * 0.16).toFixed(2)}</span>
              </div>

              <div className="pt-4">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">
                    {order.status === "processing" &&
                      "Tu pedido está siendo procesado. Te notificaremos cuando sea enviado."}
                    {order.status === "shipped" &&
                      "Tu pedido ha sido enviado. Puedes rastrearlo con el número de seguimiento."}
                    {order.status === "delivered" && "Tu pedido ha sido entregado. ¡Gracias por tu compra!"}
                    {order.status === "cancelled" && "Este pedido ha sido cancelado."}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/orders">Ver todos mis pedidos</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
