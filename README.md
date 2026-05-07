# OPCRIT+ Web

Aplicacion web estatica para registrar una historia psiquiatrica estructurada y generar orientacion diagnostica aproximada con criterios ICD-10 y DSM-5.

## Uso

Abre la app publicada en GitHub Pages:

https://jaflomd.github.io/opcrit-web/

La aplicacion funciona completamente en el navegador. Los casos se guardan en `localStorage`, por lo que no se suben a ningun servidor.

## Privacidad

- No hay backend ni base de datos remota.
- Los datos ingresados permanecen en el navegador del usuario.
- Al exportar CSV o Word, el archivo se genera localmente.

## Nota clinica

Esta herramienta es de apoyo para investigacion y organizacion clinica. Los algoritmos diagnosticos son aproximaciones basadas en criterios operacionales publicados y no equivalen al software OPCRIT+ oficial ni a algoritmos propietarios. Debe validarse antes de cualquier uso formal en investigacion o asistencia.

## Desarrollo

El proyecto es una app estatica de un solo archivo:

- `index.html`: interfaz, logica diagnostica aproximada, almacenamiento local y exportacion.

No requiere build ni dependencias.
