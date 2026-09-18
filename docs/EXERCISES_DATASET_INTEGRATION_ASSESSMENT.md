# Evaluación Técnica: Integración de `exercises-dataset`

Este documento detalla el análisis de viabilidad para integrar la colección de GIFs animados y datos del repositorio [hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset) en la aplicación Gym Tracker.

## 1. Implicaciones Legales y Licencias (CRÍTICO)

El factor más importante y bloqueante para esta integración es el aspecto legal de los recursos multimedia.

*   **Datos en texto (JSON):** Los metadatos de los ejercicios (nombres, categorías, instrucciones en múltiples idiomas) están bajo **Licencia MIT**. Esto significa que podemos usarlos, modificarlos y distribuirlos libremente, siempre que incluyamos el aviso de copyright original.
*   **Archivos Multimedia (Imágenes y GIFs):** **NO están bajo licencia MIT**.
    *   Los archivos multimedia son propiedad exclusiva de **Gym visual** (https://gymvisual.com/).
    *   El repositorio original tiene un *permiso especial y por escrito* para redistribuir el material a una resolución máxima de 180x180.
    *   El archivo `NOTICE.md` especifica claramente: *"Este repositorio no le otorga ningún derecho sobre los medios más allá de lo que permiten los términos de Gym visual — clonar este repositorio no es una licencia"*.
    *   **Conclusión Legal:** Para integrar y alojar estos GIFs en Gym Tracker, **es obligatorio** revisar los Términos y Condiciones de Gym visual y, con alta probabilidad, **adquirir una licencia comercial** directamente con ellos. Usar los GIFs sin dicha licencia constituye una infracción de derechos de autor.

## 2. Métodos de Integración Potenciales

Suponiendo que se resuelva el aspecto legal (o se use únicamente la parte de datos texto), la integración técnica sería bastante directa:

1.  **Mapeo de Datos:** El dataset incluye un archivo `data/exercises.json` muy completo con más de 1300 ejercicios. Sus IDs no coinciden con nuestro formato actual en `EXERCISE_DATABASE` (ej. `bench-press` vs `0001`).
    *   *Acción:* Se requeriría un script de migración (`scripts/sync_exercises.ts`) que cruce los nombres de los ejercicios o permita un mapeo manual.
2.  **Traducciones:** Una gran ventaja del dataset es que incluye instrucciones paso a paso en español (`es`), lo que enriquecería la información técnica que actualmente tenemos hardcodeada en `data/exercises.ts`.
3.  **Gestión de Atribución:** De adquirir los derechos, la UI de Gym Tracker (específicamente la tarjeta del ejercicio o la vista de detalles) deberá ser actualizada para mostrar permanentemente el texto de atribución obligatorio: `© Gym visual — https://gymvisual.com/`.

## 3. Consideraciones de Rendimiento y Recursos

Si los GIFs fueran alojados por nuestra cuenta:

*   **Almacenamiento (Hosting):**
    *   El dataset incluye ~1327 GIFs, ocupando un total de **126 MB**.
    *   Este volumen no debe incluirse directamente en el build frontend (carpeta `public/`).
    *   **Solución Óptima:** Subir la carpeta de vídeos al bucket actual de Supabase `routine-images`. 126 MB es un volumen muy pequeño y perfectamente manejable en el plan gratuito de Supabase.
*   **Rendimiento de Carga (Loading Performance):**
    *   Los GIFs están optimizados a una resolución fija de 180x180 píxeles. El tamaño promedio por archivo es de apenas **~90-110 KB**.
    *   Al ser tan ligeros, la carga en la aplicación móvil/web será rápida.
    *   Se recomienda implementar *Lazy Loading* (carga diferida) en las listas largas de ejercicios (como la pantalla de búsqueda) para evitar consumir ancho de banda y memoria innecesaria.
    *   *Mejora adicional:* Podría crearse un pipeline para convertir estos GIFs a formatos más modernos y eficientes (WebP animado o MP4), lo que reduciría el tamaño a la mitad y ahorraría batería en dispositivos móviles, aunque a 100 KB por GIF el impacto ya es mínimo.

## 4. Alternativas Legales y Soluciones Gratuitas

Si deseamos evitar por completo el costo y los problemas de licencia con Gym Visual, existen otras vías para dotar a la aplicación de apoyos visuales (animaciones/GIFs) de forma legal:

1.  **Uso de APIs y Datasets Open Source (Ej. wger.de):**
    *   Existen proyectos como [wger](https://wger.de/) que mantienen una base de datos abierta y comunitaria de ejercicios. 
    *   Tienen imágenes e ilustraciones generadas por la comunidad que están bajo licencias permisivas (Creative Commons CC-BY-SA), lo cual nos permite usarlas gratis dando la atribución correspondiente.
2.  **Animaciones 3D Propias (Mixamo / Blender):**
    *   Podemos usar librerías de animaciones 3D gratuitas como **Mixamo** (de Adobe) aplicadas sobre un maniquí o modelo 3D neutro.
    *   Requiere un poco de esfuerzo inicial armar un script en Blender que renderice el modelo haciendo el ejercicio, pero el resultado nos pertenecería al 100% y se vería muy profesional y estandarizado.
3.  **Animaciones Vectoriales (Lottie / SVG) o Stickman:**
    *   Podemos utilizar animaciones minimalistas estilo "stickman" (figura de palos) o Lottie files de código abierto. Son muchísimo más ligeras que un GIF (pesan menos de 10KB) y evitan cualquier reclamo de derechos de autor de fotógrafos/modelos.
4.  **Incrustar Videos de YouTube (iFrames):**
    *   En lugar de alojar nuestros propios GIFs, podemos enlazar un video corto y público de YouTube para cada ejercicio.
    *   **Legalidad:** Al usar el reproductor embebido de YouTube, no estamos distribuyendo el video, sino que Google lo hace. Las licencias y responsabilidades caen sobre YouTube, manteniéndonos exentos de responsabilidad legal.
5.  **Generación con Inteligencia Artificial:**
    *   Hoy en día se pueden usar modelos de generación de video con IA (como Stable Video Diffusion, Luma, Kling o Runway) para generar bucles cortos de 2 segundos de una persona realizando un ejercicio en específico. Los assets generados de esta forma pueden ser utilizados libremente sin pagar licencias de imagen a terceros.

## 5. Decisión del Proyecto (Actualizado)

Se ha decidido proceder con la **Opción 3 (Incrustar Videos de YouTube mediante iFrames)**. 

### Siguientes pasos para la implementación:
1. **Actualización de la Interfaz (`ExerciseTemplate`):** Modificar los tipos en `data/exercises.ts` para aceptar un atributo `youtubeVideoId`.
2. **Componente de Reproductor:** Crear un componente (ej. `YouTubeEmbed.tsx`) que reciba el ID del video y lo muestre de forma responsiva en la tarjeta del ejercicio o en sus detalles.
3. **Mapeo de Videos:** Recolectar (manual o automatizadamente) IDs de YouTube que coincidan con nuestros ejercicios principales.
4. **Traducciones del Dataset:** Dado que los datos de texto del repositorio son de licencia MIT, podemos integrar de manera segura las instrucciones y nombres en español al formato de nuestra base de datos.

## Conclusión y Recomendación

Técnicamente, la integración del dataset analizado es **altamente factible**, muy ligera en consumo de recursos y enriquecería enormemente la base de datos de la aplicación (1300+ ejercicios con instrucciones en español).

Sin embargo, a nivel legal, la integración de los GIFs es **inviable sin adquirir una licencia de Gym visual**. Se recomienda:

1.  No integrar los archivos `.gif` ni `.jpg` de este repositorio directamente.
2.  Considerar extraer únicamente los **datos de texto y descripciones en español** (MIT License) para mejorar la base de datos actual.
3.  Si las animaciones son un requerimiento crítico, contactar a Gym Visual para consultar el costo de la licencia de uso para una aplicación del tamaño de Gym Tracker.