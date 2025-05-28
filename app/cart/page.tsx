"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useCartStore } from "@/stores/cart-store"
import { useSession } from "next-auth/react"
import { useToast } from "@/hooks/use-toast"

export default function CartPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [couponCode, setCouponCode] = useState("")

  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore()

  const handleQuantityChange = (id: string | number, type: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(id, type, newQuantity)
  }

  const handleRemoveItem = (id: string | number, type: string) => {
    removeItem(id, type)
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del carrito",
    })
  }

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return

    toast({
      title: "Cupón inválido",
      description: "El código de cupón ingresado no es válido o ha expirado",
      variant: "destructive",
    })

    setCouponCode("")
  }

  const handleCheckout = () => {
    if (!session) {
      toast({
        title: "Inicia sesión para continuar",
        description: "Debes iniciar sesión para proceder al pago",
      })
      router.push("/auth/login")
      return
    }

    router.push("/checkout")
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Carrito de compras</h1>
        <Card className="text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Tu carrito está vacío</h2>
              <p className="text-muted-foreground mb-6">Parece que aún no has agregado productos a tu carrito</p>
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
      <h1 className="text-3xl font-bold mb-8">Carrito de compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Productos ({items.length})</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {items.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex py-4 px-6">
                    <div className="h-24 w-24 relative flex-shrink-0 mr-4">
                      <Image
                        src={item.image || "/placeholder.svg?height=96&width=96"}
                        alt={item.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">Tipo: {item.type}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.type, item.quantity - 1)}
                          >
                            -
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.type, item.quantity + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-semibold">${(item.price * item.quantity).toFixed(2)}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveItem(item.id, item.type)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => clearCart()}>
                Vaciar carrito
              </Button>
              <Button asChild variant="outline">
                <Link href="/wizard">Seguir comprando</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${getTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Envío</span>
                <span>Calculado en el checkout</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impuestos</span>
                <span>Calculado en el checkout</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Código de cupón"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button variant="outline" onClick={handleApplyCoupon}>
                    Aplicar
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={handleCheckout}>
                Proceder al pago
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
