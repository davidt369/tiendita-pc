"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cart-store";
import { OrderService } from "@/lib/services/order-service";

const checkoutSchema = z.object({
  cardNumber: z.string().refine(
    (val) => val.replace(/\s/g, "").length === 16,
    { message: "Número de tarjeta debe tener 16 dígitos" }
  ),
  cardName: z.string().min(3, { message: "Nombre en la tarjeta es requerido" }),
  cardExpiry: z.string().regex(/^(0[1-9]|1[0-2])\/([0-9]{2})$/, { message: "Formato debe ser MM/YY" }),
  cardCvc: z.string().regex(/^\d{3,4}$/, { message: "CVC inválido" })
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const { items, getTotal, clearCart } = useCartStore();

  useEffect(() => {
    setIsClient(true);
    const rate = localStorage.getItem('exchangeRate');
    if (rate) {
      setExchangeRate(parseFloat(rate));
    }

    const handleExchangeRateChange = () => {
      const newRate = localStorage.getItem('exchangeRate');
      if (newRate) {
        setExchangeRate(parseFloat(newRate));
      }
    };

    window.addEventListener('exchangeRateChanged', handleExchangeRateChange);
    return () => {
      window.removeEventListener('exchangeRateChanged', handleExchangeRateChange);
    };
  }, []);

  useEffect(() => {
    if (isClient && status !== "loading") {
      if (!session) {
        router.push("/auth/login");
      } else if (items.length === 0) {
        router.push("/cart");
      }
    }
  }, [isClient, items.length, router, session, status]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvc: "",
    },
  });

  if (!isClient || status === "loading" || !session || items.length === 0) {
    return null;
  }

  const total = getTotal() + 10 + getTotal() * 0.16;
  async function onSubmit(data: CheckoutFormValues) {
    setIsLoading(true);
    try {
      if (!session?.user?.email) {
        throw new Error('No se pudo identificar el usuario');
      }

      // Crear el pedido con todos los datos necesarios
      const orderData = {
        userId: session.user.email,
        items: items.map(item => ({
          id: String(item.id),
          type: item.type,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        })),
        total,
        paymentDetails: {
          cardNumber: data.cardNumber.replace(/\s/g, ""),
          cardName: data.cardName,
          cardExpiry: data.cardExpiry,
        }
      };

      console.log('Creando pedido:', orderData);
      
      const createdOrder = await OrderService.createOrder(orderData);
      
      console.log('Pedido creado exitosamente:', createdOrder);

      // Limpiar el carrito después de crear el pedido exitosamente
      clearCart();
      
      toast({
        title: "¡Pago exitoso!",
        description: "Tu pedido ha sido procesado correctamente y guardado en tu perfil.",
      });
      
      router.push("/checkout/success");
    } catch (error) {
      console.error('Error en checkout:', error);
      toast({
        variant: "destructive",
        title: "Error en el pago",
        description: "No se pudo procesar el pago. Por favor, intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Finalizar compra</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información de pago</CardTitle>
              <CardDescription>Ingresa los datos de tu tarjeta para completar la compra</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de tarjeta</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="4111 1111 1111 1111" 
                            {...field} 
                            maxLength={19}
                            onChange={(e) => {                              const value = e.target.value.replace(/\s/g, "");
                              const formatted = value.length > 0 
                                ? value.match(/.{1,4}/g)?.join(" ") || value
                                : value;
                              field.onChange(formatted);
                            }}
                          />
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
                          <Input 
                            placeholder="JUAN PEREZ" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
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
                            <Input 
                              placeholder="MM/YY" 
                              {...field}
                              maxLength={5}
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, "");
                                if (value.length >= 2) {
                                  value = value.slice(0, 2) + "/" + value.slice(2);
                                }
                                field.onChange(value);
                              }}
                            />
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
                            <Input 
                              placeholder="123" 
                              {...field}
                              type="password"
                              maxLength={4}
                              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ""))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando pago...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Pagar ${total.toFixed(2)}
                        {exchangeRate && (
                          <span className="ml-1">
                            ({(total * exchangeRate).toFixed(2)} Bs)
                          </span>
                        )}
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
                      <div className="text-right">
                        <div className="text-sm">${(item.price * item.quantity).toFixed(2)}</div>
                        {exchangeRate && (
                          <div className="text-xs text-muted-foreground">
                            {(item.price * item.quantity * exchangeRate).toFixed(2)} Bs
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <div className="text-right">
                    <div>${getTotal().toFixed(2)}</div>
                    {exchangeRate && (
                      <div className="text-xs text-muted-foreground">
                        {(getTotal() * exchangeRate).toFixed(2)} Bs
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <div className="text-right">
                    <div>$10.00</div>
                    {exchangeRate && (
                      <div className="text-xs text-muted-foreground">
                        {(10 * exchangeRate).toFixed(2)} Bs
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">IVA (16%)</span>
                  <div className="text-right">
                    <div>${(getTotal() * 0.16).toFixed(2)}</div>
                    {exchangeRate && (
                      <div className="text-xs text-muted-foreground">
                        {(getTotal() * 0.16 * exchangeRate).toFixed(2)} Bs
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between">
                  <span className="font-bold">Total</span>
                  <div className="text-right">
                    <div className="font-bold">${total.toFixed(2)}</div>
                    {exchangeRate && (
                      <div className="text-sm font-semibold text-green-600">
                        {(total * exchangeRate).toFixed(2)} Bs
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
