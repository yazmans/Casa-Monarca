# Casa Monarca - Sistema de Optimización de Inventario y Menús

Este repositorio contiene la plataforma web y el motor de optimización desarrollados para **Casa Monarca**. El sistema está diseñado para facilitar la gestión del inventario de alimentos y automatizar la creación de menús diarios, aplicando modelos matemáticos para minimizar costos operativos mientras se cumplen estrictas restricciones nutricionales.

## Arquitectura

El proyecto utiliza una arquitectura dividida en un frontend moderno y un backend dedicado a la lógica de optimización:

### Frontend
* **Next.js (App Router) & React:** Framework principal de la interfaz web.
* **TypeScript:** Lenguaje principal (92% del código fuente) para garantizar un tipado seguro.
* **Tailwind CSS / Shadcn UI:** Estilos y componentes visuales (`postcss.config.mjs`, `components.json`).
* **pnpm:** Gestor de paquetes principal del proyecto.

### Backend y Optimización
* **Python:** El motor backend (`/backend`) procesa la lógica de datos.
* **Investigación de Operaciones:** El sistema resuelve modelos de programación lineal y entera (método simplex, análisis de sensibilidad) para encontrar la distribución óptima de los alimentos.

## Estructura del Proyecto

* `/app`: Rutas principales, páginas y layouts de la aplicación web (Next.js).
* `/backend`: Scripts de Python, lógica del servidor y algoritmos de optimización determinista.
* `/components`: Componentes reutilizables de React para la interfaz de usuario.
* `/hooks`: Custom hooks para el manejo de estado y lógica en el frontend.
* `/lib`: Funciones utilitarias y configuraciones compartidas.
* `/public`: Imágenes, íconos y otros activos estáticos.
* `/styles`: Archivos de estilo globales (CSS).

## Instalación y Ejecución Local

### Prerrequisitos
* [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
* [pnpm](https://pnpm.io/)
* [Python 3.x](https://www.python.org/)

### Frontend

1. Instala las dependencias de Node:
   ```bash
   pnpm install
