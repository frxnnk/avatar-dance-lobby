# Avatar GLB Placeholder

Para que la aplicación funcione correctamente, necesitas agregar un archivo `avatar.glb` en esta carpeta (`public/`).

## Requisitos del modelo GLB:

1. **Formato**: GLB (binary GLTF)
2. **Rigging**: Debe estar riggeado (SkinnedMesh)
3. **Morph Targets**: Debe tener morph targets para la boca con nombres como:
   - `JawOpen` (recomendado)
   - `MouthOpen`
   - `viseme_aa` (ARKit)
   - O cualquier nombre que contenga "mouth", "jaw", "aa"

## Donde obtener avatares GLB:

### Gratuitos:
- [Ready Player Me](https://readyplayer.me) - Crea avatares con morph targets
- [Mixamo](https://mixamo.com) - Avatares de Adobe (requiere añadir morph targets)
- [VRoid Hub](https://hub.vroid.com) - Avatares anime/manga

### De pago:
- [Unity Asset Store](https://assetstore.unity.com)
- [Sketchfab](https://sketchfab.com)
- [TurboSquid](https://turbosquid.com)

## Crear tu propio avatar:

1. **Blender** (gratuito):
   - Modela o importa un personaje
   - Añade shape keys para la boca
   - Exporta como GLB

2. **Ready Player Me** (más fácil):
   - Ve a https://readyplayer.me
   - Crea tu avatar
   - Descarga el GLB con blend shapes

## Temporalmente:

Si no tienes un GLB listo, la aplicación mostrará un error en la consola pero la UI funcionará. Puedes probar el audio sin el avatar visual.

## Una vez que tengas el archivo:

Simplemente coloca `avatar.glb` en esta carpeta y reinicia la aplicación.