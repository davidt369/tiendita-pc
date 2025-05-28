"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, Copy, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"

import { PlatformSelector } from "@/components/steps/platform-selector"
import { CPUSelector } from "@/components/steps/cpu-selector"
import { MotherboardSelector } from "@/components/steps/motherboard-selector"
import { RAMSelector } from "@/components/steps/ram-selector"
import { GPUSelector } from "@/components/steps/gpu-selector"
import { StorageSelector } from "@/components/steps/storage-selector"
import { PSUSelector } from "@/components/steps/psu-selector"
import { CaseSelector } from "@/components/steps/case-selector"
import { PeripheralsSelector } from "@/components/steps/peripherals-selector"
import { BuildSummary } from "@/components/build-summary"
import { validateCompatibility } from "@/lib/compatibility"
import { useCartStore } from "@/stores/cart-store"
import { useWizardStore } from "@/stores/wizard-store"
import type { SavedBuild } from "@/lib/types"

const STEPS = [
  { id: "platform", label: "Plataforma" },
  { id: "cpu", label: "CPU" },
  { id: "motherboard", label: "Placa Madre" },
  { id: "ram", label: "Memoria RAM" },
  { id: "gpu", label: "GPU" },
  { id: "storage", label: "Almacenamiento" },
  { id: "psu", label: "Fuente de Poder" },
  { id: "case", label: "Gabinete" },
  { id: "peripherals", label: "Periféricos" },
  { id: "summary", label: "Resumen" },
]

export function PCBuilderWizard() {
  const router = useRouter()
  const { toast } = useToast()
  const addToCart = useCartStore((state) => state.addItem)
  const { step, build, setStep, updateBuild } = useWizardStore()

  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>([])
  const [buildName, setBuildName] = useState("")
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [loadDialogOpen, setLoadDialogOpen] = useState(false)
  const [compatibilityIssues, setCompatibilityIssues] = useState<string[]>([])

  // Load saved builds from localStorage on component mount
  useEffect(() => {
    const savedBuildsFromStorage = localStorage.getItem("savedBuilds")
    if (savedBuildsFromStorage) {
      setSavedBuilds(JSON.parse(savedBuildsFromStorage))
    }
  }, [])

  // Check compatibility whenever build changes
  useEffect(() => {
    const issues = validateCompatibility(build)
    setCompatibilityIssues(issues)
  }, [build])

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const handlePrevious = () => {
    if (step > 0) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSaveBuild = () => {
    if (!buildName.trim()) return

    const newSavedBuild: SavedBuild = {
      id: Date.now().toString(),
      name: buildName,
      build: { ...build },
      date: new Date().toISOString(),
    }

    const updatedSavedBuilds = [...savedBuilds, newSavedBuild]
    setSavedBuilds(updatedSavedBuilds)
    localStorage.setItem("savedBuilds", JSON.stringify(updatedSavedBuilds))
    setBuildName("")
    setSaveDialogOpen(false)

    toast({
      title: "Configuración guardada",
      description: `Tu configuración "${buildName}" ha sido guardada correctamente.`,
    })
  }

  const handleLoadBuild = (savedBuild: SavedBuild) => {
    updateBuild(savedBuild.build)
    setLoadDialogOpen(false)

    toast({
      title: "Configuración cargada",
      description: `La configuración "${savedBuild.name}" ha sido cargada correctamente.`,
    })
  }

  const handleDuplicateBuild = (savedBuild: SavedBuild) => {
    const duplicatedBuild: SavedBuild = {
      ...savedBuild,
      id: Date.now().toString(),
      name: `${savedBuild.name} (copia)`,
      date: new Date().toISOString(),
    }

    const updatedSavedBuilds = [...savedBuilds, duplicatedBuild]
    setSavedBuilds(updatedSavedBuilds)
    localStorage.setItem("savedBuilds", JSON.stringify(updatedSavedBuilds))

    toast({
      title: "Configuración duplicada",
      description: `Se ha creado una copia de "${savedBuild.name}".`,
    })
  }

  const handleDeleteBuild = (buildId: string) => {
    const updatedSavedBuilds = savedBuilds.filter((build) => build.id !== buildId)
    setSavedBuilds(updatedSavedBuilds)
    localStorage.setItem("savedBuilds", JSON.stringify(updatedSavedBuilds))

    toast({
      title: "Configuración eliminada",
      description: "La configuración ha sido eliminada correctamente.",
    })
  }

  const handleExportBuild = () => {
    const buildData = JSON.stringify(build, null, 2)
    const blob = new Blob([buildData], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${buildName || "pc-build"}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Configuración exportada",
      description: "Tu configuración ha sido exportada como archivo JSON.",
    })
  }

  const handleAddToCart = () => {
    // Verificar que haya componentes seleccionados
    if (!build.cpu || !build.motherboard || !build.ram || !build.psu || !build.case) {
      toast({
        variant: "destructive",
        title: "Configuración incompleta",
        description: "Debes seleccionar al menos los componentes básicos para añadir al carrito.",
      })
      return
    }

    // Verificar compatibilidad
    if (compatibilityIssues.length > 0) {
      toast({
        variant: "destructive",
        title: "Problemas de compatibilidad",
        description: "Resuelve los problemas de compatibilidad antes de añadir al carrito.",
      })
      return
    }

    // Añadir CPU al carrito
    if (build.cpu) {
      addToCart({
        id: build.cpu.id,
        type: "cpu",
        name: build.cpu.nombre,
        price: build.cpu.precio,
        quantity: 1,
        image: build.cpu.imagen_url,
      })
    }

    // Añadir placa madre al carrito
    if (build.motherboard) {
      addToCart({
        id: build.motherboard.id,
        type: "motherboard",
        name: build.motherboard.nombre,
        price: build.motherboard.precio,
        quantity: 1,
        image: build.motherboard.imagen_url,
      })
    }

    // Añadir RAM al carrito
    if (build.ram) {
      addToCart({
        id: build.ram.id,
        type: "ram",
        name: build.ram.nombre,
        price: build.ram.precio,
        quantity: build.ram.quantity || 1,
        image: build.ram.imagen_url,
      })
    }

    // Añadir GPU al carrito si está seleccionada
    if (build.gpu) {
      addToCart({
        id: build.gpu.id,
        type: "gpu",
        name: build.gpu.nombre,
        price: build.gpu.precio,
        quantity: 1,
        image: build.gpu.imagen_url,
      })
    }

    // Añadir almacenamiento al carrito
    if (build.storage) {
      if (Array.isArray(build.storage)) {
        build.storage.forEach((storage) => {
          addToCart({
            id: storage.id,
            type: "storage",
            name: storage.nombre,
            price: storage.precio,
            quantity: 1,
            image: storage.imagen_url,
          })
        })
      } else {
        addToCart({
          id: build.storage.id,
          type: "storage",
          name: build.storage.nombre,
          price: build.storage.precio,
          quantity: 1,
          image: build.storage.imagen_url,
        })
      }
    }

    // Añadir fuente de poder al carrito
    if (build.psu) {
      addToCart({
        id: build.psu.id,
        type: "psu",
        name: build.psu.nombre,
        price: build.psu.precio,
        quantity: 1,
        image: build.psu.imagen_url,
      })
    }

    // Añadir gabinete al carrito
    if (build.case) {
      addToCart({
        id: build.case.id,
        type: "case",
        name: build.case.nombre,
        price: build.case.precio,
        quantity: 1,
        image: build.case.imagen_url,
      })
    }

    // Añadir periféricos al carrito si hay seleccionados
    if (build.peripherals && build.peripherals.length > 0) {
      build.peripherals.forEach((peripheral) => {
        addToCart({
          id: peripheral.id,
          type: "peripheral",
          name: peripheral.nombre,
          price: peripheral.precio,
          quantity: 1,
          image: peripheral.imagen_url,
        })
      })
    }

    toast({
      title: "Configuración añadida al carrito",
      description: "Todos los componentes han sido añadidos al carrito.",
    })

    // Redirigir al carrito
    router.push("/cart")
  }

  const renderStepContent = () => {
    const currentStep = STEPS[step]

    switch (currentStep.id) {
      case "platform":
        return <PlatformSelector build={build} updateBuild={updateBuild} />
      case "cpu":
        return <CPUSelector build={build} updateBuild={updateBuild} />
      case "motherboard":
        return <MotherboardSelector build={build} updateBuild={updateBuild} />
      case "ram":
        return <RAMSelector build={build} updateBuild={updateBuild} />
      case "gpu":
        return <GPUSelector build={build} updateBuild={updateBuild} />
      case "storage":
        return <StorageSelector build={build} updateBuild={updateBuild} />
      case "psu":
        return <PSUSelector build={build} updateBuild={updateBuild} />
      case "case":
        return <CaseSelector build={build} updateBuild={updateBuild} />
      case "peripherals":
        return <PeripheralsSelector build={build} updateBuild={updateBuild} />
      case "summary":
        return <BuildSummary build={build} issues={compatibilityIssues} />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>
            Paso {step + 1} de {STEPS.length}
          </span>
          <span>{STEPS[step].label}</span>
        </div>
        <Progress value={((step + 1) / STEPS.length) * 100} className="h-2" />
      </div>

      {/* Steps indicator */}
      <div className="hidden md:flex justify-between mb-8">
        {STEPS.map((stepItem, index) => (
          <div
            key={stepItem.id}
            className={`flex flex-col items-center ${index <= step ? "text-primary" : "text-muted-foreground"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                index <= step ? "bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {index < step ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className="text-xs hidden lg:block">{stepItem.label}</span>
          </div>
        ))}
      </div>

      {/* Compatibility warnings */}
      {compatibilityIssues.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>
            <ul className="list-disc pl-5">
              {compatibilityIssues.map((issue, index) => (
                <li key={index}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <Card>
        <CardContent className="pt-6">{renderStepContent()}</CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <div>
          <Button variant="outline" onClick={() => setLoadDialogOpen(true)} className="mr-2">
            Cargar
          </Button>
          <Button variant="outline" onClick={() => setSaveDialogOpen(true)} disabled={!build.cpu || !build.motherboard}>
            Guardar
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrevious} disabled={step === 0}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Anterior
          </Button>
          {step === STEPS.length - 1 ? (
            <Button onClick={handleAddToCart} disabled={compatibilityIssues.length > 0}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Añadir al carrito
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={step === STEPS.length - 1}>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Save dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar configuración</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="build-name">Nombre de la configuración</Label>
              <Input
                id="build-name"
                value={buildName}
                onChange={(e) => setBuildName(e.target.value)}
                placeholder="Mi PC Gamer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveBuild} disabled={!buildName.trim()}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Load dialog */}
      <Dialog open={loadDialogOpen} onOpenChange={setLoadDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Cargar configuración</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {savedBuilds.length === 0 ? (
              <p className="text-center text-muted-foreground">No hay configuraciones guardadas</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {savedBuilds.map((savedBuild) => (
                  <Card key={savedBuild.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{savedBuild.name}</h3>
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDuplicateBuild(savedBuild)}
                            className="h-8 w-8"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteBuild(savedBuild.id)}
                            className="h-8 w-8 text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {new Date(savedBuild.date).toLocaleDateString()}
                      </p>
                      <Button variant="outline" className="w-full" onClick={() => handleLoadBuild(savedBuild)}>
                        Cargar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
