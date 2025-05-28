export interface PCBuild {
  platform: string
  cpu: any | null
  motherboard: any | null
  ram: any | null
  gpu: any | null
  storage: any | null
  psu: any | null
  case: any | null
  peripherals: any[]
}

export interface SavedBuild {
  id: string
  name: string
  build: PCBuild
  date: string
}
