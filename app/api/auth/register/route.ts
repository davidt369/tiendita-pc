import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    // Validar datos
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Faltan campos requeridos" }, { status: 400 })
    }

    // En un entorno real, aquí se guardaría el usuario en la base de datos
    // y se verificaría si el email ya existe

    // Simular un retraso para mostrar el estado de carga
    await new Promise((resolve) => setTimeout(resolve, 1000))

    return NextResponse.json({ message: "Usuario registrado correctamente" }, { status: 201 })
  } catch (error) {
    console.error("Error al registrar usuario:", error)
    return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
  }
}
