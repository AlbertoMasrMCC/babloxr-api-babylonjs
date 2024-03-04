# babloxr-api-babylonjs
Biblioteca que contiene la API para el funcionamiento de BabloXR

## Versiones
### Versión 1.2.0
Fecha: 2023-11-28
Incluye:
1. createImage - Función para crear una textura con una imágen.
2. createAudio - Función para crear un audio con base en una URL de firebase storage.

### Versión 1.1.0
Fecha: 2023-11-28
Incluye:
1. createXR - Función para crear un ambiente XR en BabylonJS, primero valida si el dispositivo es apto para entorno AR y VR, y posteriormente retorna un botón para crea el ambiente (En caso de ser apto).

### Versión 1.0.0
Fecha: 2023-11-18
Incluye:
1. createVideo - Función para crear una ventana de video en BabylonJS, la cual contiene una barra superrior con el título del video, en la parte intermedia un panel con el video a reproducir y en la parte inferior se le acoplan controles para poder pausar/reproducir y detener el video.
2. createTest - Funcion para crear una ventana de prueba en BabylonJS, la cual contiene una barra superrior con el título de la prueba, un panel con la pregunta y las posibles respuestas (Selección múltiple).

## Cómo usar
Una vez instalado, importa BABLOXR API de la siguiente manera:    
`import * as BABLOXR from 'babloxr-api-babylonjs';`

Y ya puedes comenzar a utilizar sus funciones.