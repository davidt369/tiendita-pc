import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PCBuild } from "@/lib/types"

type WizardStore = {
  step: number
  build: PCBuild
  setStep: (step: number) => void
  updateBuild: (build: PCBuild) => void
  resetWizard: () => void
  addToCart: () => void
}

const initialBuild: PCBuild = {
  platform: "",
  cpu: null,
  motherboard: null,
  ram: null,
  gpu: null,
  storage: null,
  psu: null,
  case: null,
  peripherals: [],
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      step: 0,
      build: initialBuild,

      setStep: (step) => {
        set({ step })
      },

      updateBuild: (build) => {
        set({ build })
      },

      resetWizard: () => {
        set({ step: 0, build: initialBuild })
      },

      addToCart: () => {
        // Esta función se implementará para agregar la configuración al carrito
        // Utilizará useCartStore para agregar los componentes seleccionados
      },
    }),
    {
      name: "wizard-storage",
    },
  ),
)
