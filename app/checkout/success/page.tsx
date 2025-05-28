"use client"

import Link from "next/link"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useCartStore } from "@/stores/cart-store"

export default function CheckoutSuccessPage() {
  const router = useRouter()
  const { items } = useCartStore()

  // Redirigir si el carrito no está vacío (significa que no se completó un pedido)
  useEffect(() => {
    if (items.length > 0) {
      router.push("/cart")
    }
  }, [items, router])

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
            Tu pedido ha sido procesado correctamente. Hemos enviado un correo electrónico con los detalles de tu
            compra.
          </p>
          <div className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-center space-x-2 text-sm">
              <Package className="h-4 w-4" />
              <span>Número de pedido: #ORD-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link href="/orders">
              Ver mis pedidos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
