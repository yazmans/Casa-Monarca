# Casa Monarca — Sistema de Administración de Inventario y Menús
Aplicación web para **Casa Monarca** que permite gestionar el inventario de alimentos y generar menús semanales optimizados usando programación lineal (CBC).

---

## ¿Qué hace?

La app tiene cuatro secciones principales:

| Pestaña | Descripción |
|---|---|
| **Optimizar** | Genera un menú semanal de costo mínimo que cumple requerimientos nutricionales, restricciones de almacenamiento y variedad. |
| **Menú Manual** | Planificador semanal para armar menús a mano. |
| **Inventario** | Tabla de productos con stock actual, alertas de capacidad y formulario para agregar/eliminar insumos. |
| **Recetas** | Catálogo de recetas disponibles con su composición de ingredientes. |

### Motor de optimización (Python)

El archivo [backend/optimize.py](backend/optimize.py) resuelve un modelo de **programación lineal entera mixta** con PuLP que:

- Planifica **7 días × 3 comidas** (Desayuno, Comida, Cena).
- Soporta **3 tamaños de porción** (Pequeña, Mediana, Grande) y sus requerimientos de proteína/guarnición.
- Maneja **3 tipos de almacenamiento** (Ambiente, Refrigerado, Congelado) con capacidades y vida útil por ingrediente.
- Minimiza el **costo total de compra** garantizando:
  - Variedad de proteínas y guarniciones (sin repetir en días consecutivos).
  - Al menos una comida de Res y una de Mojarra en la semana.
  - Reserva de emergencia del 15 % al final de la semana.
  - Restricciones de caducidad por tipo de almacenamiento.

El front-end llama al solver vía la API Route [`/api/optimize`](app/api/optimize/route.ts), que ejecuta el script Python como subproceso y devuelve el resultado en JSON.

---

## Requisitos

- **Node.js** ≥ 18 y **pnpm**
- **Python 3** con la librería `pulp` instalada

```bash
pip install pulp
```

> El proyecto actualmente apunta a Python en `/Library/Frameworks/Python.framework/Versions/3.14/bin/python3` (macOS). Si tu instalación está en otra ruta, edita [app/api/optimize/route.ts](app/api/optimize/route.ts) y ajusta la ruta del ejecutable.

---

## ¿Cómo correrlo?

### 1. Instalar dependencias de Node

```bash
pnpm install
```

### 2. Levantar el servidor de desarrollo

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

### Otros comandos

| Comando | Descripción |
|---|---|
| `pnpm build` | Genera el build de producción |
| `pnpm start` | Inicia el servidor en modo producción |
| `pnpm lint` | Corre ESLint |

---

## Stack tecnológico

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, shadcn/ui, Recharts
- **Backend / Solver**: Python 3, PuLP (CBC)
- **Gestor de paquetes**: pnpm
