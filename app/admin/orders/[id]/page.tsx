"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Loader2, Package, Truck, CheckCircle, XCircle, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { apiService, type Order } from "@/lib/api-service"

export default function AdminOrderDetailPage() {
  const router = useRouter()
  const { id } = useParams()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [orderStatus, setOrderStatus] = useState<"processing" | "shipped" | "delivered" | "cancelled">("processing")
  const [trackingNumber, setTrackingNumber] = useState("")
  const [estimatedDelivery, setEstimatedDelivery] = useState("")

  // Verificar si el usuario es administrador
  useEffect(() => {
    if (status === "authenticated") {
      if (session?.user?.role !== "admin") {
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
  }, [])

  // Cargar detalles del pedido
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (status !== "authenticated" || session?.user?.role !== "admin" || !id) return

      try {
        setIsLoading(true)
        const data = await apiService.getOrderById(id as string)

        if (!data) {
          toast({
            variant: "destructive",
            title: "Pedido no encontrado",
            description: "El pedido que buscas no existe o ha sido eliminado.",
          })
          router.push("/admin/orders")
          return
        }

        setOrder(data)
        setOrderStatus(data.status)
        setTrackingNumber(data.trackingNumber || "")
        setEstimatedDelivery(data.estimatedDelivery ? new Date(data.estimatedDelivery).toISOString().split("T")[0] : "")
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error al cargar el pedido",
          description: "No se pudo cargar la información del pedido. Inténtalo de nuevo más tarde.",
        })
        router.push("/admin/orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [id, status, session, router, toast])

  // Función para actualizar el pedido
  const handleUpdateOrder = async () => {
    if (!order) return

    try {
      setIsSaving(true)
      const updatedOrder: Order = {
        ...order,
        status: orderStatus,
        trackingNumber: trackingNumber || undefined,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery).toISOString() : undefined,
      }

      await apiService.updateOrder(updatedOrder)
      setOrder(updatedOrder)

      toast({
        title: "Pedido actualizado",
        description: "La información del pedido ha sido actualizada correctamente.",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al actualizar el pedido",
        description: "No se pudo actualizar la información del pedido. Inténtalo de nuevo más tarde.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Función para formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Función para obtener icono de estado
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "processing":
        return <Package className="h-5 w-5" />
      case "shipped":
        return <Truck className="h-5 w-5" />
      case "delivered":
        return <CheckCircle className="h-5 w-5" />
      case "cancelled":
        return <XCircle className="h-5 w-5" />
      default:
        return null
    }
  }

  // Función para obtener color de badge según estado
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
          <Link href="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a pedidos
          </Link>
        </Button>

        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center">
              <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Pedido no encontrado</h2>
              <p className="text-muted-foreground mb-6">El pedido que buscas no existe o ha sido eliminado</p>
              <Button asChild>
                <Link href="/admin/orders">Ver todos los pedidos</Link>
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
        <Link href="/admin/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a pedidos
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
                {getStatusBadge(order.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Cliente</h3>
                    <div className="space-y-1">
                      <p className="font-medium">{order.userName}</p>
                      <p className="text-muted-foreground">{order.userEmail}</p>
                      <p className="text-sm text-muted-foreground">ID: {order.userId}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Estado del pedido</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="status">Estado</Label>
                        <Select value={orderStatus} onValueChange={(value) => setOrderStatus(value as any)}>
                          <SelectTrigger id="status">
                            <SelectValue placeholder="Seleccionar estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="processing">En procesamiento</SelectItem>
                            <SelectItem value="shipped">Enviado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                            <SelectItem value="cancelled">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="tracking">Número de seguimiento</Label>
                        <Input
                          id="tracking"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="TRK-123456789"
                        />
                      </div>
                      <div>
                        <Label htmlFor="delivery-date">Fecha estimada de entrega</Label>
                        <Input
                          id="delivery-date"
                          type="date"
                          value={estimatedDelivery}
                          onChange={(e) => setEstimatedDelivery(e.target.value)}
                        />
                      </div>
                      <Button onClick={handleUpdateOrder} disabled={isSaving} className="w-full">
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Guardar cambios
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-4">Productos</h3>
                  <div className="divide-y">
                    {order.items.map((item, index) => (
                      <div key={item.id ? `${item.type}-${item.id}` : `item-${index}`} className="flex py-4">
                        <div className="h-20 w-20 relative flex-shrink-0 mr-4">
                          <Image
                            src={item.image || "/placeholder.svg?height=80&width=80"}
                            alt={item.name || "Product image"}
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
                <p className="font-medium">{order.shippingDetails?.name}</p>
                <p>{order.shippingDetails?.address}</p>
                <p>
                  {order.shippingDetails?.city}, {order.shippingDetails?.state} {order.shippingDetails?.postalCode}
                </p>
                <p>{order.shippingDetails?.country}</p>
                <p className="text-muted-foreground">{order.shippingDetails?.email}</p>
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
                      "Este pedido está siendo procesado. Actualiza el estado cuando sea enviado."}
                    {order.status === "shipped" &&
                      "Este pedido ha sido enviado. Actualiza el estado cuando sea entregado."}
                    {order.status === "delivered" && "Este pedido ha sido entregado al cliente."}
                    {order.status === "cancelled" && "Este pedido ha sido cancelado."}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/orders">Ver todos los pedidos</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
