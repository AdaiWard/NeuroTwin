'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls, useGLTF } from '@react-three/drei';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import type { Region } from '@/types/neuro';
import { regionForLabel, regions } from '@/lib/brainRegions';
import BrainFallback from './BrainFallback';

type Props = {
  selected: Region | null;
  onSelect?: (r: Region) => void;
  resetKey: number;
  rotating: boolean;
  surface: boolean;
  reduced: boolean;
  onLoaded: () => void;
  onFailure: () => void;
};
function WebGLFallback({ onFailure }: { onFailure: () => void }) {
  useEffect(() => {
    onFailure();
  }, [onFailure]);
  return <BrainFallback message="WebGL недоступен. Показана 2D-иллюстрация." />;
}
function Model({ selected, onSelect, surface, onLoaded }: Props) {
  const gltf = useGLTF('/models/brain.glb', '/draco/');
  const [hovered, setHovered] = useState<string | null>(null);
  const parts = useMemo(() => {
    const out: {
      mesh: THREE.Mesh;
      region: Region | null;
      label: string;
      material: THREE.MeshPhysicalMaterial;
      anchor: THREE.Vector3 | null;
    }[] = [];
    const anchored = new Set<string>();
    gltf.scene.traverse((o) => {
      if (!(o instanceof THREE.Mesh)) return;
      // Multi-material glTF structures load as Groups. Their anatomy metadata lives
      // on the parent node, while primitive meshes carry only material metadata.
      let anatomy: THREE.Object3D | null = o;
      while (anatomy && !anatomy.userData.bx_cat) anatomy = anatomy.parent;
      if (!anatomy || !['cortex', 'cerebellum', 'brainstem'].includes(anatomy.userData.bx_cat))
        return;
      const label = String(anatomy.userData.bx_label ?? anatomy.name),
        region = anatomy.userData.bx_cat === 'cortex' ? regionForLabel(label) : null;
      const material = new THREE.MeshPhysicalMaterial({
        color: '#505771',
        roughness: 0.62,
        metalness: 0.16,
        clearcoat: 0.1,
        clearcoatRoughness: 0.6,
      });
      // Anchor each visible halo to an actual lateral surface vertex, never an invented coordinate.
      let anchor: THREE.Vector3 | null = null;
      if (
        region &&
        anatomy.userData.bx_side === 'left' &&
        !anchored.has(label) &&
        /Superior parietal lobule|Inferior temporal gyrus|Middle frontal gyrus|Superior frontal gyrus/.test(
          label,
        )
      ) {
        const p = o.geometry.getAttribute('position');
        let best = -Infinity;
        for (let i = 0; i < p.count; i++) {
          if (p.getX(i) > best) {
            best = p.getX(i);
            anchor = new THREE.Vector3().fromBufferAttribute(p, i);
          }
        }
        anchored.add(label);
      }
      out.push({ mesh: o, region, label, material, anchor });
    });
    return out;
  }, [gltf]);
  useEffect(() => {
    onLoaded();
    return () => {
      parts.forEach((p) => p.material.dispose());
    };
  }, [onLoaded, parts]);
  useFrame((_, dt) => {
    const base = new THREE.Color('#505771');
    parts.forEach((p) => {
      const active = surface && p.region && (!selected || selected === p.region);
      const target = active
        ? new THREE.Color(regions[p.region!].color).lerp(base, selected ? 0.48 : 0.64)
        : base;
      p.material.color.lerp(target, Math.min(1, dt * 5));
      p.material.emissive.copy(
        active ? new THREE.Color(regions[p.region!].color) : new THREE.Color('#000000'),
      );
      p.material.emissiveIntensity = active ? (p.label === hovered ? 0.18 : 0.045) : 0;
    });
  });
  return (
    <group scale={24} position={[0, -39.26, 0.2]}>
      {parts.map(({ mesh, material, region, label, anchor }) => (
        <group key={mesh.uuid}>
          <mesh
            geometry={mesh.geometry}
            material={material}
            matrix={mesh.matrix}
            matrixAutoUpdate={false}
            onClick={(e) => {
              e.stopPropagation();
              if (region) onSelect?.(region);
            }}
            onPointerOver={(e) => {
              if (region) {
                e.stopPropagation();
                setHovered(label);
                document.body.style.cursor = 'pointer';
              }
            }}
            onPointerOut={() => {
              setHovered(null);
              document.body.style.cursor = '';
            }}
          />
          {surface && anchor && region && (!selected || selected === region) && (
            <Html position={anchor} center distanceFactor={5.5} occlude zIndexRange={[5, 0]}>
              <button
                className="brain-pin"
                style={{ '--pin': regions[region].color } as React.CSSProperties}
                onClick={() => onSelect?.(region)}
                aria-label={`Выбрать: ${regions[region].title}`}
                title={regions[region].title}
              >
                <span />
              </button>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
function CameraRig({ selected, resetKey, rotating, reduced }: Props) {
  const controls = useRef<OrbitControlsImpl>(null),
    target = useRef<THREE.Vector3 | null>(null);
  const { camera, invalidate } = useThree();
  useEffect(() => {
    target.current = new THREE.Vector3(5.4, 2.5, 4.8);
    invalidate();
  }, [resetKey, invalidate]);
  useEffect(() => {
    if (selected) {
      target.current = new THREE.Vector3(
        ...({
          attention: [5.7, 4.8, -3.4],
          memory: [6.3, 0.8, 3.8],
          executive: [5.3, 2.1, 5.2],
          stress: [4.5, 4.8, 4.3],
        }[selected] as [number, number, number]),
      );
      invalidate();
    }
  }, [selected, invalidate]);
  useFrame((_, dt) => {
    if (target.current) {
      if (reduced) camera.position.copy(target.current);
      else camera.position.lerp(target.current, Math.min(1, dt * 3));
      controls.current?.update();
      if (camera.position.distanceTo(target.current) < 0.015) target.current = null;
      else invalidate();
    }
  });
  return (
    <OrbitControls
      ref={controls}
      enablePan={false}
      minDistance={5}
      maxDistance={10}
      minPolarAngle={0.35}
      maxPolarAngle={2.15}
      enableDamping
      dampingFactor={0.075}
      autoRotate={rotating && !reduced && !selected}
      autoRotateSpeed={0.38}
      onStart={() => {
        target.current = null;
      }}
    />
  );
}
export default function BrainScene(props: Props) {
  return (
    <Canvas
      dpr={[1, 1.65]}
      camera={{ position: [5.4, 2.5, 4.8], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      frameloop={props.reduced && !props.rotating ? 'demand' : 'always'}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.2;
      }}
      fallback={<WebGLFallback onFailure={props.onFailure} />}
    >
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#c3d6ff', '#19182b', 1.05]} />
      <directionalLight position={[3, 7, 5]} intensity={2.6} color="#d7e2ff" />
      <directionalLight position={[-4, 2, -4]} intensity={3.4} color="#a19aff" />
      <directionalLight position={[4, -1, -3]} intensity={1.8} color="#679bad" />
      <Suspense fallback={null}>
        <Model {...props} />
      </Suspense>
      <CameraRig {...props} />
    </Canvas>
  );
}
