"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"
import { calculateTotalWattage } from "@/lib/calculations"

interface PSUSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function PSUSelector({ build, updateBuild }: PSUSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredPSUs, setFilteredPSUs] = useState(mockData.fuente)
  const [estimatedWattage, setEstimatedWattage] = useState(0)

  // Calculate estimated wattage
  useEffect(() => {
    setEstimatedWattage(calculateTotalWattage(build))
  }, [build])

  // Filter PSUs based on search term
  useEffect(() => {
    const filtered = mockData.fuente.filter((psu) => {
      return psu.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    })

    setFilteredPSUs(filtered)
  }, [searchTerm])

  const handleSelectPSU = (psu: any) => {
    updateBuild({ ...build, psu })
  }

  const isPSUSufficient = (psuWatts: number) => {
    // Recommended to have at least 20% headroom
    return psuWatts >= estimatedWattage * 1.2
  }

  if (!build.cpu || !build.motherboard || !build.ram) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Completa los pasos anteriores primero</h3>
        <p className="text-muted-foreground">
          Debes seleccionar los componentes básicos antes de elegir una fuente de poder
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu Fuente de Poder</h2>
        <p className="text-muted-foreground mb-6">Elige una fuente de poder para tu PC</p>
      </div>

      <div className="p-4 border rounded-md bg-muted/30 mb-6">
        <h3 className="font-medium mb-2">Consumo estimado: {estimatedWattage}W</h3>
        <p className="text-sm text-muted-foreground">
          Recomendamos una fuente con al menos {Math.ceil(estimatedWattage * 1.2)}W para tener un margen de seguridad
        </p>
      </div>

      <div className="mb-6">
        <Label htmlFor="search-psu">Buscar</Label>
        <Input
          id="search-psu"
          placeholder="Buscar fuente de poder..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPSUs.map((psu) => (
          <Card
            key={psu.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              build.psu?.id === psu.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectPSU(psu)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={psu.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={psu.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{psu.nombre}</h3>
                  <p className="text-sm text-muted-foreground">
                    {psu.watts}W • {psu.eficiencia}
                  </p>
                </div>
                {build.psu?.id === psu.id && <Check className="ml-auto h-5 w-5 text-primary" />}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className={`text-sm ${isPSUSufficient(psu.watts) ? "text-green-500" : "text-destructive"}`}>
                  {isPSUSufficient(psu.watts) ? "Potencia suficiente" : "Potencia insuficiente"}
                </span>
                <span className="font-semibold">${psu.precio.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredPSUs.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron fuentes de poder que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
