"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Laptop, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleGoogleSignUp = async () => {
    try {
      const result = await signIn("google", {
        callbackUrl: "/",
        redirect: false,
      })

      if (result?.error) {
        toast({
          variant: "destructive",
          title: "Error al registrarse",
          description: "No se pudo crear la cuenta con Google. Inténtalo de nuevo.",
        })
      } else if (result?.url) {
        // Redirigir manualmente si es necesario
        window.location.href = result.url
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al registrarse",
        description: "Ocurrió un error inesperado. Inténtalo de nuevo más tarde.",
      })
    }
  }

  if (status === "loading") {
    return (
      <div className="container max-w-md mx-auto py-16 px-4 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Verificando sesión...</p>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="flex justify-center mb-8">
        <div className="flex items-center space-x-2">
          <Laptop className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl">PC Builder</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Crear cuenta</CardTitle>
          <CardDescription className="text-center">
            Regístrate con tu cuenta de Google para comenzar a armar tu PC personalizada
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleGoogleSignUp} className="w-full" size="lg">
            <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Registrarse con Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-muted-foreground">
            Al registrarte, aceptas nuestros{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Términos de Servicio
            </Link>{" "}
            y{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Política de Privacidad
            </Link>
          </div>
          <div className="text-sm text-center text-muted-foreground">
            ¿Ya tienes una cuenta?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Inicia sesión
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
