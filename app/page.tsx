import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, Check, Cpu, HardDrive, Zap } from "lucide-react"
import { ProductRecommendation } from "@/components/product-recommendation"

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center">
            <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Arma la PC de tus sueños con nuestro asistente inteligente
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Configura tu PC personalizada con componentes compatibles y al mejor precio, sin conocimientos técnicos
                necesarios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="text-lg">
                  <Link href="/wizard">
                    Comenzar a armar
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg">
                  <Link href="/products">Ver componentes</Link>
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2">
              <div className="relative h-[400px] w-full">
                <Image
                  src="https://cloudfront-us-east-1.images.arcpublishing.com/infobae/UGRPUCERCVBSJAN2HQ5ZQYI2QE.jpg"
                  alt="PC Gaming"
                  fill
                  className="object-cover rounded-lg shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ProductRecommendation type="featured" title="Componentes destacados" count={4} showViewAll={true} />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Por qué elegir nuestro PC Builder?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Compatibilidad garantizada</h3>
                <p className="text-muted-foreground">
                  Nuestro sistema verifica automáticamente que todos los componentes sean compatibles entre sí.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Proceso simplificado</h3>
                <p className="text-muted-foreground">
                  Interfaz intuitiva paso a paso que te guía en cada etapa del proceso de configuración.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Cpu className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Amplio catálogo</h3>
                <p className="text-muted-foreground">
                  Cientos de componentes de las mejores marcas para que encuentres exactamente lo que necesitas.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <HardDrive className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Guarda tus configuraciones</h3>
                <p className="text-muted-foreground">
                  Crea y guarda múltiples configuraciones para comparar o comprar más tarde.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Category Sections */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ProductRecommendation type="cpu" title="Procesadores recomendados" count={4} showViewAll={true} />
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <ProductRecommendation type="gpu" title="Tarjetas gráficas recomendadas" count={4} showViewAll={true} />
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">¿Cómo funciona?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Selecciona tus componentes</h3>
              <p className="text-muted-foreground">
                Elige cada componente paso a paso con nuestro asistente inteligente que filtra opciones compatibles.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Revisa tu configuración</h3>
              <p className="text-muted-foreground">
                Verifica el resumen de tu PC, con detalles de compatibilidad, consumo energético y precio total.
              </p>
            </div>
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Realiza tu pedido</h3>
              <p className="text-muted-foreground">
                Completa tu compra y recibe tu PC personalizada lista para usar en la dirección que elijas.
              </p>
            </div>
          </div>
          <div className="text-center mt-12">
            <Button asChild size="lg">
              <Link href="/wizard">Comenzar ahora</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para armar tu PC ideal?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Comienza ahora y obtén la PC que siempre has querido, con componentes de calidad y compatibilidad
            garantizada.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/wizard">
              Comenzar a armar mi PC
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
