"use client";

import { useGLTF } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { use, useEffect, useMemo, useState } from "react";
import {
  CubeUVReflectionMapping,
  DataTexture,
  DataUtils,
  HalfFloatType,
  LinearFilter,
  LinearSRGBColorSpace,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  RGBAFormat,
  type Mesh,
  type Object3D,
  type Vector3,
  type WebGLRenderer,
} from "three";
import type { KTX2Loader as StdlibKTX2Loader } from "three-stdlib";
// three's own loader: it matches the r186 Basis transcoder served from /basis/. three-stdlib's
// older loader speaks a different worker protocol and hangs silently with this transcoder.
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/**
 * The museum's Blender rooms, shared by the guided tour (/museum) and the scroll journey (/).
 * Lighting is baked into each room's texture atlas, so surfaces are drawn unlit.
 */

export const COURT_URL = "/models/court.glb";
/** The FlowDesk wing and the project showroom it opens into: one building, one file. */
export const SHOWROOM_URL = "/models/showroom.glb";
export const SKY = "#a9c1d8";
export const GROUND = "#8c7b66";

const BASIS_TRANSCODER = "/basis/";
// Blender drives the bronze's roughness from a brushed-grain node that glTF cannot carry,
// so the export falls back to 1.0 (chalk). This is the cast finish approved in F2.
const BRONZE_ROUGHNESS = 0.38;
const SCREEN_ANISOTROPY = 8;

// One KTX2 loader for the page: it owns the Basis transcoder worker pool.
let ktx2Loader: KTX2Loader | null = null;
function getKtx2Loader(gl: WebGLRenderer): KTX2Loader {
  ktx2Loader ??= new KTX2Loader().setTranscoderPath(BASIS_TRANSCODER).detectSupport(gl);
  return ktx2Loader;
}

/**
 * Loads a baked room. MeshBasicMaterial is the cheapest material three.js has, which is what
 * keeps mid-range phones at frame rate; only the monument's bronze stays a real-time metal.
 */
export function useBakedScene(url: string): Object3D {
  const gl = useThree((state) => state.gl);
  const { scene } = useGLTF(url, false, true, (loader) => {
    // drei's GLTFLoader (three-stdlib) only calls load() on it, which both classes share.
    loader.setKTX2Loader(getKtx2Loader(gl) as unknown as StdlibKTX2Loader);
  });
  return useMemo(() => {
    scene.traverse((node) => {
      const mesh = node as Mesh;
      if (!mesh.isMesh) return;
      const source = mesh.material as MeshStandardMaterial;
      // The interface displays are read at an angle: anisotropic filtering keeps their text sharp.
      if (source.name.startsWith("M_screen_") && source.map) {
        source.map.anisotropy = Math.min(SCREEN_ANISOTROPY, gl.capabilities.getMaxAnisotropy());
      }
      // The Code Monument's bronze is the one real-time material: metal needs reflections, not a bake.
      mesh.material =
        source.metalness > 0.5 && !source.map
          ? new MeshStandardMaterial({ color: source.color, metalness: 1, roughness: BRONZE_ROUGHNESS })
          : // Untextured parts (the showroom's live screen and connection) keep their base colour.
            new MeshBasicMaterial({ map: source.map ?? null, color: source.map ? 0xffffff : source.color });
      mesh.matrixAutoUpdate = false;
      mesh.updateMatrix();
    });
    return scene;
  }, [scene, gl]);
}

/**
 * Compiles a room's shaders without blocking the main thread (KHR_parallel_shader_compile,
 * where the browser has it) and uploads its textures, then reports true. Until then the room
 * stays hidden: a synchronous first-frame compile froze this laptop for 2.5 s, and is the
 * leading suspect for the Phase 2 iPhone freeze. The root scene is passed so the programs
 * match the real render (its reflection environment included).
 */
export function useCompiledScene(scene: Object3D): boolean {
  const gl = useThree((state) => state.gl);
  const camera = useThree((state) => state.camera);
  const root = useThree((state) => state.scene);
  const [compiledScene, setCompiledScene] = useState<Object3D | null>(null);

  useEffect(() => {
    let cancelled = false;
    gl.compileAsync(scene, camera, root).then(() => {
      if (cancelled) return;
      scene.traverse((node) => {
        const map = ((node as Mesh).material as MeshBasicMaterial | undefined)?.map;
        if (map) gl.initTexture(map);
      });
      setCompiledScene(scene);
    });
    return () => {
      cancelled = true;
    };
  }, [scene, gl, camera, root]);

  return compiledScene === scene;
}

/**
 * A moving part's exported position. Kept on the node itself because the loaded scene is cached
 * and shared by the guided tour (/museum) and the journey (/): whichever page moved it last, the
 * other still knows where it belongs.
 */
export function restPosition(node: Object3D): Vector3 {
  node.userData.rest ??= node.position.clone();
  return node.userData.rest as Vector3;
}

export function Ground({ color = GROUND }: { readonly color?: string }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.32}>
      <planeGeometry args={[240, 240]} />
      <meshBasicMaterial color={color} />
    </mesh>
  );
}

/**
 * The bronze's reflections: three's RoomEnvironment, prefiltered (PMREM) ahead of time by
 * tools/env-bake into three's CubeUV layout, so the browser skips half a second or more of blocked
 * main thread. Stored as an ordinary opaque PNG, twice as tall as the texture: RGB mantissas on
 * top, each texel's shared exponent below (RGBE without an alpha channel, so nothing is
 * premultiplied when the browser decodes it).
 */
const BRONZE_ENVIRONMENT_URL = "/env/bronze-room-128.png";
const ENVIRONMENT_WIDTH = 384;
const ENVIRONMENT_HEIGHT = 512;

async function loadBakedEnvironment(): Promise<DataTexture | null> {
  try {
    const response = await fetch(BRONZE_ENVIRONMENT_URL);
    if (!response.ok) return null;
    const bitmap = await createImageBitmap(await response.blob(), { colorSpaceConversion: "none", premultiplyAlpha: "none" });
    if (bitmap.width !== ENVIRONMENT_WIDTH || bitmap.height !== ENVIRONMENT_HEIGHT * 2) return null;
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return null;
    context.drawImage(bitmap, 0, 0);
    bitmap.close();
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

    const count = ENVIRONMENT_WIDTH * ENVIRONMENT_HEIGHT;
    const texels = new Uint16Array(count * 4);
    const one = DataUtils.toHalfFloat(1);
    for (let i = 0; i < count; i += 1) {
      const exponent = pixels[(count + i) * 4];
      const scale = exponent === 0 ? 0 : 2 ** (exponent - 128) / 256;
      for (let channel = 0; channel < 3; channel += 1) texels[i * 4 + channel] = DataUtils.toHalfFloat(pixels[i * 4 + channel] * scale);
      texels[i * 4 + 3] = one;
    }
    const texture = new DataTexture(texels, ENVIRONMENT_WIDTH, ENVIRONMENT_HEIGHT, RGBAFormat, HalfFloatType);
    texture.mapping = CubeUVReflectionMapping;
    texture.colorSpace = LinearSRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  } catch {
    // A failed request or decode: prefilter at runtime instead, as before.
    return null;
  }
}

let bakedEnvironment: Promise<DataTexture | null> | null = null;

/**
 * Suspends until the reflections are ready. Place it inside the same Suspense boundary as the
 * Court, so the bronze's shader is compiled once, with its environment.
 */
export function BronzeEnvironment() {
  bakedEnvironment ??= loadBakedEnvironment();
  const texture = use(bakedEnvironment);
  return texture ? <primitive object={texture} attach="environment" /> : <RuntimeEnvironment />;
}

function RuntimeEnvironment() {
  const gl = useThree((state) => state.gl);
  const texture = useMemo(() => new PMREMGenerator(gl).fromScene(new RoomEnvironment(), 0.04, 0.1, 100, { size: 128 }).texture, [gl]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <primitive object={texture} attach="environment" />;
}
