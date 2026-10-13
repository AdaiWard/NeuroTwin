# Third-party asset credits

## Human brain geometry

- Local file: `public/models/brain.glb`, 4,650,816 bytes (4.44 MiB).
- Source: [Brain Project by itayinbarr](https://github.com/itayinbarr/brainproject).
- Download: https://raw.githubusercontent.com/itayinbarr/brainproject/2929e94f521a8ddceab26bc100a98dc06b0da060/brain-atlas/models/brain.glb
- Upstream commit: `2929e94f521a8ddceab26bc100a98dc06b0da060`.
- SHA-256: `76a49ea4526a4880613aec7a02756bd7301b0b9d0680d7cae33e197b672c5453`.
- Copyright: **Z-Anatomy contributors and BodyParts3D / The Database Center for Life Science (DBCLS)**. Brain Project packages the model and its structure metadata.
- Asset license: [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/). Upstream's explicit asset notice is retained in `public/models/SOURCE_LICENSE.txt`; this file distinguishes its Apache code license from its CC BY-SA model license.
- The binary is unmodified. NeuroTwin supplies new rendering materials and selectively displays the source cortex, cerebellum and brainstem. Functional region associations and colored presentation are NeuroTwin's illustrative annotations, not measurements. Redistributed adaptations of the model must retain CC BY-SA 4.0 and attribution.
- The GLB contains 437 anatomical nodes/meshes, including 128 cortex nodes and two hemispheres. Nodes with several materials load as groups; the viewer resolves anatomy from their parents. Its displayed cortex has recognizable gyri and sulci.
- Generic educational anatomy; no representation of the user's personal anatomy. Some unused internal structures in the bundled original derive from open imaging atlases; their additional upstream credits are preserved in `SOURCE_LICENSE.txt`.
- Manifest: `public/models/manifest.json`, unchanged upstream metadata under the same asset license.

## Draco decoder

`public/draco/` contains the offline glTF Draco decoder shipped with Three.js. Copyright Google Draco authors, Apache License 2.0. License retained at `public/draco/LICENSE.txt`. No Google-hosted decoder is fetched at runtime.

## Typeface

`public/fonts/manrope.ttf`: Manrope variable font, Copyright 2018 The Manrope Project Authors, [Google Fonts source](https://github.com/google/fonts/tree/main/ofl/manrope), SIL Open Font License 1.1. Full license retained in `public/fonts/OFL.txt`. Supports Cyrillic and is served locally.

## Other assets

Lucide icons are supplied by the `lucide-react` dependency under ISC. The NeuroTwin SVG favicon and 2D brain fallback are original project artwork (MIT). Screenshots were captured from this application with Playwright and Chrome; they include the attributed anatomy model.
