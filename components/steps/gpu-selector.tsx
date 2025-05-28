"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"

interface GPUSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function GPUSelector({ build, updateBuild }: GPUSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredGPUs, setFilteredGPUs] = useState(mockData.gpu)

  // Filter GPUs based on search term
  useEffect(() => {
    const filtered = mockData.gpu.filter((gpu) => {
      return gpu.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    })

    setFilteredGPUs(filtered)
  }, [searchTerm])

  const handleSelectGPU = (gpu: any) => {
    updateBuild({ ...build, gpu })
  }

  if (!build.motherboard) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Completa los pasos anteriores primero</h3>
        <p className="text-muted-foreground">Debes seleccionar los componentes básicos antes de elegir una GPU</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu Tarjeta Gráfica</h2>
        <p className="text-muted-foreground mb-6">Elige una GPU para tu PC</p>
      </div>

      <div className="mb-6">
        <Label htmlFor="search-gpu">Buscar</Label>
        <Input
          id="search-gpu"
          placeholder="Buscar tarjeta gráfica..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGPUs.map((gpu) => (
          <Card
            key={gpu.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              build.gpu?.id === gpu.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectGPU(gpu)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={gpu.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={gpu.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{gpu.nombre}</h3>
                  <p className="text-sm text-muted-foreground">Tamaño: {gpu.tamano_gpu}</p>
                </div>
                {build.gpu?.id === gpu.id && <Check className="ml-auto h-5 w-5 text-primary" />}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">{gpu.watts}W</span>
                <span className="font-semibold">${gpu.precio.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredGPUs.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron GPUs que coincidan con tu búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
