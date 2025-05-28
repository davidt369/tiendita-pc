"use client"
import Image from "next/image"
import { AlertCircle, Check, Download } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import type { PCBuild } from "@/lib/types"
import { calculateTotalPrice, calculateTotalWattage } from "@/lib/calculations"

interface BuildSummaryProps {
  build: PCBuild
  issues: string[]
}

export function BuildSummary({ build, issues }: BuildSummaryProps) {
  const totalPrice = calculateTotalPrice(build)
  const totalWattage = calculateTotalWattage(build)

  const handleExportBuild = () => {
    const buildData = JSON.stringify(build, null, 2)
    const blob = new Blob([buildData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "pc-build.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const renderComponentRow = (label: string, component: any, price: number) => {
    if (!component) return null

    return (
      <div className="flex items-center py-3 border-b">
        <div className="w-12 h-12 relative mr-3">
          <Image
            src={component.imagen_url || "/placeholder.svg?height=48&width=48"}
            alt={component.nombre}
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
        <div className="flex-1">
          <h4 className="font-medium">{component.nombre}</h4>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
        <div className="text-right">
          <span className="font-semibold">${price.toFixed(2)}</span>
        </div>
      </div>
    )
  }

  const renderMultipleComponentsRow = (label: string, components: any[]) => {
    if (!components || components.length === 0) return null

    return (
      <div className="py-3 border-b">
        <div className="flex items-center mb-2">
          <h4 className="font-medium">{label}</h4>
          <span className="ml-auto font-semibold">
            ${components.reduce((sum, item) => sum + item.precio, 0).toFixed(2)}
          </span>
        </div>
        <div className="space-y-2 pl-4">
          {components.map((component) => (
            <div key={component.id} className="flex items-center">
              <div className="w-8 h-8 relative mr-2">
                <Image
                  src={component.imagen_url || "/placeholder.svg?height=32&width=32"}
                  alt={component.nombre}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-sm">{component.nombre}</p>
              </div>
              <div className="text-right">
                <span className="text-sm">${component.precio.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Resumen de tu PC</h2>
        <p className="text-muted-foreground mb-6">Revisa los componentes seleccionados y el precio total</p>
      </div>

      {issues.length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Problemas de compatibilidad</AlertTitle>
          <AlertDescription>
            <ul className="list-disc pl-5 mt-2">
              {issues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Componentes</CardTitle>
            </CardHeader>
            <CardContent>
              {renderComponentRow("CPU", build.cpu, build.cpu?.precio || 0)}
              {renderComponentRow("Placa Madre", build.motherboard, build.motherboard?.precio || 0)}
              {renderComponentRow(
                "Memoria RAM",
                build.ram,
                build.ram ? build.ram.precio * (build.ram.quantity || 1) : 0,
              )}
              {renderComponentRow("GPU", build.gpu, build.gpu?.precio || 0)}
              {Array.isArray(build.storage)
                ? renderMultipleComponentsRow("Almacenamiento", build.storage)
                : renderComponentRow("Almacenamiento", build.storage, build.storage?.precio || 0)}
              {renderComponentRow("Fuente de Poder", build.psu, build.psu?.precio || 0)}
              {renderComponentRow("Gabinete", build.case, build.case?.precio || 0)}
              {build.peripherals &&
                build.peripherals.length > 0 &&
                renderMultipleComponentsRow("Periféricos", build.peripherals)}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Consumo estimado:</span>
                  <span className="font-medium">{totalWattage}W</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Componentes:</span>
                  <span className="font-medium">
                    {Object.values(build).filter((v) => v && (!Array.isArray(v) || v.length > 0)).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Compatibilidad:</span>
                  <span className={issues.length === 0 ? "text-green-500 font-medium" : "text-destructive font-medium"}>
                    {issues.length === 0 ? (
                      <span className="flex items-center">
                        <Check className="mr-1 h-4 w-4" /> Compatible
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <AlertCircle className="mr-1 h-4 w-4" /> {issues.length} problemas
                      </span>
                    )}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={handleExportBuild} disabled={issues.length > 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar configuración
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
