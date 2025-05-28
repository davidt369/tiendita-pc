"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"

interface CaseSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function CaseSelector({ build, updateBuild }: CaseSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredCases, setFilteredCases] = useState(mockData.gabinete)

  // Filter cases based on motherboard format and search term
  useEffect(() => {
    if (!build.motherboard) return

    const filtered = mockData.gabinete.filter((caseItem) => {
      // Check if case supports the motherboard format
      const supportsFormat =
        caseItem.formato_compatible === build.motherboard?.formato ||
        (caseItem.formato_compatible === "ATX" &&
          ["Micro-ATX", "Mini-ITX"].includes(build.motherboard?.formato || "")) ||
        (caseItem.formato_compatible === "Micro-ATX" && build.motherboard?.formato === "Mini-ITX")

      // Check if case has enough space for GPU if one is selected
      const hasSpaceForGPU = !build.gpu || caseItem.max_gpu_mm >= Number.parseInt(build.gpu.tamano_gpu)

      // Filter by search term
      const matchesSearch = caseItem.nombre.toLowerCase().includes(searchTerm.toLowerCase())

      return supportsFormat && hasSpaceForGPU && matchesSearch
    })

    setFilteredCases(filtered)
  }, [build.motherboard, build.gpu, searchTerm])

  const handleSelectCase = (caseItem: any) => {
    updateBuild({ ...build, case: caseItem })
  }

  if (!build.motherboard || !build.psu) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Completa los pasos anteriores primero</h3>
        <p className="text-muted-foreground">Debes seleccionar los componentes básicos antes de elegir un gabinete</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu Gabinete</h2>
        <p className="text-muted-foreground mb-6">
          Elige un gabinete compatible con tu placa madre ({build.motherboard.formato})
          {build.gpu && ` y tu GPU (${build.gpu.tamano_gpu})`}
        </p>
      </div>

      <div className="mb-6">
        <Label htmlFor="search-case">Buscar</Label>
        <Input
          id="search-case"
          placeholder="Buscar gabinete..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCases.map((caseItem) => (
          <Card
            key={caseItem.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              build.case?.id === caseItem.id ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectCase(caseItem)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={caseItem.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={caseItem.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{caseItem.nombre}</h3>
                  <p className="text-sm text-muted-foreground">
                    {caseItem.formato_compatible} • Max GPU: {caseItem.max_gpu_mm}mm
                  </p>
                </div>
                {build.case?.id === caseItem.id && <Check className="ml-auto h-5 w-5 text-primary" />}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">{caseItem.formato_compatible}</span>
                <span className="font-semibold">${caseItem.precio.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredCases.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No se encontraron gabinetes compatibles con tus componentes</p>
          </div>
        )}
      </div>
    </div>
  )
}
