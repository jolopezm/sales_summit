Quiero que inicialices un proyecto web llamado "sales_summit".

Contexto del producto:

- Es una aplicación gratuita y open-source para vendedores.
- Es local-first.
- No tiene backend.
- No tiene autenticación.
- No almacena datos de usuarios en servidores.
- Todos los datos viven localmente en el dispositivo/navegador del usuario.
- En una versión futura puede existir una aplicación nativa Android/iOS, por lo que el dominio y el formato de exportación de datos deben mantenerse desacoplados del almacenamiento web.
- El proyecto será usado como portfolio, así que prioriza código simple, legible y bien estructurado sobre abstracciones innecesarias.

Stack obligatorio:

- Svelte 5
- TypeScript
- Vite
- CSS propio, sin Tailwind ni frameworks de componentes
- IndexedDB mediante Dexie
- PWA
- Vitest
- Lucide icons si necesitamos iconos
- npm como package manager

No usar:

- React
- Redux
- backend
- APIs propias
- Firebase
- Supabase
- Tailwind
- Bootstrap
- librerías de gráficos para el indicador circular; hacerlo con SVG/CSS
- ORM adicional fuera de Dexie
- arquitectura enterprise o abstracciones innecesarias

Arquitectura deseada:

src/
lib/
components/
domain/
db/
repositories/
services/
routes/

La UI no debe acceder directamente a Dexie.
Toda persistencia debe pasar por repositorios.

Modelo inicial:

SellerProfile:

- name
- commissionRate
- monthlyGoal
- workSchedule

Sale:

- id: UUID
- amount: integer
- soldAt: ISO timestamp
- createdAt: ISO timestamp

Reglas:

- El dinero se almacena como entero, nunca float.
- commissionRate se expresa como decimal; por ejemplo, 0.007 representa 0,7%.
- Cada Sale debe usar crypto.randomUUID().
- Las fechas persistidas deben usar ISO 8601.
- El código de dominio no debe depender de Svelte ni Dexie.

Primera tarea:

1. Inicializa el proyecto.
2. Configura TypeScript.
3. Configura Vitest.
4. Configura Dexie e IndexedDB.
5. Configura una PWA mínima instalable y preparada para funcionamiento offline.
6. Crea la estructura de carpetas.
7. Implementa los tipos SellerProfile y Sale.
8. Implementa SaleRepository como interfaz.
9. Implementa DexieSaleRepository.
10. Implementa funciones puras para:

- total de ventas
- promedio por venta
- comisión acumulada
- porcentaje de progreso hacia la meta
- dinero restante para alcanzar la meta

11. Añade tests unitarios para esas funciones.
12. Crea una pantalla inicial mínima inspirada en una aplicación móvil:

- header
- tarjeta de progreso mensual
- total acumulado
- meta mensual
- monto restante
- dos o tres métricas
- botón "Registrar venta"
- navegación inferior con Resumen, Ventas y Perfil

13. Usa datos mock inicialmente para la pantalla.
14. Haz que el diseño sea mobile-first, con ancho máximo razonable en desktop.
15. No implementes todavía edición de perfil, import/export ni Google Drive.

Antes de terminar:

- ejecuta tests
- ejecuta typecheck
- ejecuta build
- corrige cualquier error
- muéstrame brevemente qué archivos creaste y las decisiones principales

No expandas el alcance más allá de esto.

Primero queremos comprobar:

proyecto levanta
↓
arquitectura está bien
↓
Dexie funciona
↓
tests funcionan
↓
PWA compila

despues aplicamos estilos mas "pulidos" de app

queremos obtener algo asi:
┌──────────────────────────┐
│ SEPTIEMBRE DE 2026 │
│ Hola, José │
│ │
│ ┌──────────────────┐ │
│ │ 47% │ │
│ │ $23.490 │ │
│ │ Meta $50.000 │ │
│ └──────────────────┘ │
│ │
│ Tu ritmo │
│ ┌───────┐ ┌───────────┐ │
│ │ $392 │ │ $164 │ │
│ └───────┘ └───────────┘ │
│ │
│ + Registrar │
│ │
├──────────────────────────┤
│ Resumen Ventas Perfil │
└──────────────────────────┘
