"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, CreditCard } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { useCartStore } from "@/stores/cart-store"
import { api } from "@/lib/api"

const checkoutSchema = z.object({
  name: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres" }),
  email: z.string().email({ message: "Ingresa un correo electrónico válido" }),
  address: z.string().min(5, { message: "La dirección debe tener al menos 5 caracteres" }),
  city: z.string().min(2, { message: "La ciudad es requerida" }),
  state: z.string().min(2, { message: "El estado/provincia es requerido" }),
  postalCode: z.string().min(3, { message: "El código postal es requerido" }),
  country: z.string().min(2, { message: "El país es requerido" }),
  paymentMethod: z.enum(["credit", "debit", "paypal"]),
  cardNumber: z.string().optional(),
  cardName: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const { items, getTotal, clearCart } = useCartStore()

  // Redirigir si no hay sesión o el carrito está vacío
  if (typeof window !== "undefined") {
    if (!session) {
      router.push("/auth/login")
    } else if (items.length === 0) {
      router.push("/cart")
    }
  }

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      name: session?.user?.name || "",
      email: session?.user?.email || "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      paymentMethod: "credit",
    },
  })

  const paymentMethod = form.watch("paymentMethod")

  async function onSubmit(data: CheckoutFormValues) {
    setIsLoading(true)

    try {
      // En un entorno real, esto sería una llamada a la API para procesar el pago y crear el pedido
      await api.post("/api/orders", {
        items,
        total: getTotal(),
        shippingDetails: {
          name: data.name,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          country: data.country,
        },
        paymentMethod: data.paymentMethod,
      })

      // Simular un retraso para mostrar el estado de carga
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Limpiar el carrito después de un pedido exitoso
      clearCart()

      toast({
        title: "¡Pedido realizado con éxito!",
        description: "Recibirás un correo electrónico con los detalles de tu pedido.",
      })

      router.push("/checkout/success")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al procesar el pedido",
        description: "Ocurrió un error al procesar tu pedido. Por favor, inténtalo de nuevo.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de envío y pago</CardTitle>
              <CardDescription>Completa los detalles para procesar tu pedido</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Información de contacto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Juan Pérez" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Correo electrónico</FormLabel>
                            <FormControl>
                              <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dirección de envío</h3>
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Dirección</FormLabel>
                          <FormControl>
                            <Input placeholder="Calle y número" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad</FormLabel>
                            <FormControl>
                              <Input placeholder="Ciudad" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estado/Provincia</FormLabel>
                            <FormControl>
                              <Input placeholder="Estado o provincia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="postalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código postal</FormLabel>
                            <FormControl>
                              <Input placeholder="Código postal" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>País</FormLabel>
                            <FormControl>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un país" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="argentina">Argentina</SelectItem>
                                  <SelectItem value="chile">Chile</SelectItem>
                                  <SelectItem value="colombia">Colombia</SelectItem>
                                  <SelectItem value="mexico">México</SelectItem>
                                  <SelectItem value="peru">Perú</SelectItem>
                                  <SelectItem value="espana">España</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Método de pago</h3>
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-2"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit" id="credit" />
                                <FormLabel htmlFor="credit" className="cursor-pointer">
                                  Tarjeta de crédito
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="debit" id="debit" />
                                <FormLabel htmlFor="debit" className="cursor-pointer">
                                  Tarjeta de débito
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="paypal" id="paypal" />
                                <FormLabel htmlFor="paypal" className="cursor-pointer">
                                  PayPal
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {(paymentMethod === "credit" || paymentMethod === "debit") && (
                      <Tabs defaultValue="card" className="w-full">
                        <TabsList className="grid w-full grid-cols-1">
                          <TabsTrigger value="card">Detalles de la tarjeta</TabsTrigger>
                        </TabsList>
                        <TabsContent value="card" className="space-y-4 mt-4">
                          <FormField
                            control={form.control}
                            name="cardNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número de tarjeta</FormLabel>
                                <FormControl>
                                  <Input placeholder="1234 5678 9012 3456" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="cardName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nombre en la tarjeta</FormLabel>
                                <FormControl>
                                  <Input placeholder="JUAN PEREZ" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="cardExpiry"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Fecha de expiración</FormLabel>
                                  <FormControl>
                                    <Input placeholder="MM/AA" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="cardCvc"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVC</FormLabel>
                                  <FormControl>
                                    <Input placeholder="123" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </TabsContent>
                      </Tabs>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando pedido...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Completar compra
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Productos ({items.length})</h3>
                <div className="space-y-2">
                  {items.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {item.quantity} x {item.name}
                      </span>
                      <span className="text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${getTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span>$10.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span>${(getTotal() * 0.16).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>${(getTotal() + 10 + getTotal() * 0.16).toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
