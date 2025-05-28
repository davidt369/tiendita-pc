"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Check, AlertCircle, Trash2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { PCBuild } from "@/lib/types"
import { mockData } from "@/lib/mock-data"

interface StorageSelectorProps {
  build: PCBuild
  updateBuild: (build: PCBuild) => void
}

export function StorageSelector({ build, updateBuild }: StorageSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredStorage, setFilteredStorage] = useState(mockData.almacenamiento)
  const [selectedStorage, setSelectedStorage] = useState<any[]>(build.storage ? (Array.isArray(build.storage) ? build.storage : [build.storage]) : [])

  // Filter storage based on search term
  useEffect(() => {
    const filtered = mockData.almacenamiento.filter((storage) => {
      return storage.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    })

    setFilteredStorage(filtered)
  }, [searchTerm])

  const handleSelectStorage = (storage: any) => {
    // Add the storage to the selected list if not already selected
    if (!selectedStorage.some((item) => item.id === storage.id)) {
      const updatedStorage = [...selectedStorage, storage]
      setSelectedStorage(updatedStorage)
      updateBuild({ ...build, storage: updatedStorage.length === 1 ? updatedStorage[0] : updatedStorage })
    }
  }

  const handleRemoveStorage = (storageId: number) => {
    const updatedStorage = selectedStorage.filter((item) => item.id !== storageId)
    setSelectedStorage(updatedStorage)
    updateBuild({
      ...build,
      storage: updatedStorage.length === 1 ? updatedStorage[0] : updatedStorage.length === 0 ? null : updatedStorage,
    })
  }

  if (!build.motherboard) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Completa los pasos anteriores primero</h3>
        <p className="text-muted-foreground">
          Debes seleccionar los componentes básicos antes de elegir almacenamiento
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4">Selecciona tu Almacenamiento</h2>
        <p className="text-muted-foreground mb-6">Elige uno o más dispositivos de almacenamiento para tu PC</p>
      </div>

      {selectedStorage.length > 0 && (
        <div className="mb-6">
          <h3 className="font-medium mb-3">Almacenamiento seleccionado</h3>
          <div className="space-y-2">
            {selectedStorage.map((storage) => (
              <div key={storage.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center">
                  <div className="w-10 h-10 relative mr-3">
                    <Image
                      src={storage.imagen_url || "/placeholder.svg?height=40&width=40"}
                      alt={storage.nombre}
                      width={40}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium">{storage.nombre}</h4>
                    <p className="text-sm text-muted-foreground">
                      {storage.tipo} • {storage.capacidad_gb}GB
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold mr-4">${typeof storage.precio === 'number' ? storage.precio.toFixed(2) : 'N/A'}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveStorage(storage.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <Label htmlFor="search-storage">Buscar</Label>
        <Input
          id="search-storage"
          placeholder="Buscar almacenamiento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStorage.map((storage) => (
          <Card
            key={storage.id}
            className={`cursor-pointer transition-all hover:border-primary ${
              selectedStorage.some((item) => item.id === storage.id) ? "border-2 border-primary" : ""
            }`}
            onClick={() => handleSelectStorage(storage)}
          >
            <CardContent className="p-4">
              <div className="flex items-center mb-3">
                <div className="w-16 h-16 relative mr-3">
                  <Image
                    src={storage.imagen_url || "/placeholder.svg?height=64&width=64"}
                    alt={storage.nombre}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h3 className="font-medium line-clamp-2">{storage.nombre}</h3>
                  <p className="text-sm text-muted-foreground">
                    {storage.tipo} • {storage.capacidad_gb}GB
                  </p>
                </div>
                {selectedStorage.some((item) => item.id === storage.id) && (
                  <Check className="ml-auto h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-muted-foreground">{storage.tipo}</span>
                <span className="font-semibold">${typeof storage.precio === 'number' ? storage.precio.toFixed(2) : 'N/A'}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredStorage.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">
              No se encontraron dispositivos de almacenamiento que coincidan con tu búsqueda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
