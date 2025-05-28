import { PCBuilderWizard } from "@/components/pc-builder-wizard"

export default function WizardPage() {
  return (
    <div className="container mx-auto py-16 px-4">
      <h1 className="text-3xl font-bold mb-8">Armado de PC a Medida</h1>
      <PCBuilderWizard />
    </div>
  )
}
