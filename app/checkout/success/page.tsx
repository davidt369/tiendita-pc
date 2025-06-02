"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Check, Package, ArrowRight, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/stores/cart-store"
import { OrderService } from "@/lib/services/order-service"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items } = useCartStore()
  const [latestOrder, setLatestOrder] = useState<any>(null)

  // Redirigir si el carrito no está vacío (significa que no se completó un pedido)
  useEffect(() => {
    if (items.length > 0) {
      router.push("/cart")
    }
  }, [items, router])

  // Obtener el pedido más reciente del usuario
  useEffect(() => {
    if (session?.user?.email) {
      const userOrders = OrderService.getUserLocalOrders(session.user.email)
      if (userOrders.length > 0) {
        // Obtener el pedido más reciente
        const mostRecent = userOrders.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0]
        setLatestOrder(mostRecent)
      }
    }
  }, [session])

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto my-6 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">¡Pedido completado!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Tu pedido ha sido procesado correctamente y guardado en tu perfil. 
            Puedes consultar todos tus pedidos en cualquier momento.
          </p>
          {latestOrder && (
            <div className="rounded-lg bg-muted p-4 space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm">
                <Package className="h-4 w-4" />
                <span>Número de pedido: #{latestOrder.id}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Total: ${latestOrder.total.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                {latestOrder.items.length} producto{latestOrder.items.length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              Ver en mi perfil
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Continuar comprando</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
