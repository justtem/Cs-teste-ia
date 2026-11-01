import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WeaponSpec } from '../standaloneHtmlGenerator';
import {
  buildCalibratedWeaponAssembly,
  ULTIMATE_GUNS_GLB_MANIFEST,
  WEAPON_GLB_VISUAL_CONFIGS,
} from '../glbWeaponRegistry';

interface WeaponShop3DPreviewProps {
  spec: WeaponSpec;
}

export const WeaponShop3DPreview: React.FC<WeaponShop3DPreviewProps> = ({ spec }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const activeGroupRef = useRef<THREE.Group | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = Math.max(220, container.clientWidth || 320);
    const height = Math.max(105, container.clientHeight || 115);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.05, 20);
    camera.position.set(0, 0.08, 1.38);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xf8fafc, 0x1e293b, 1.55);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 2.3);
    keyLight.position.set(2.2, 2.6, 2.8);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.15);
    rimLight.position.set(-2.4, 1.2, -1.8);
    scene.add(rimLight);

    let frameId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();
      if (activeGroupRef.current) {
        activeGroupRef.current.rotation.y = elapsed * 0.78;
        activeGroupRef.current.position.y = Math.sin(elapsed * 2.1) * 0.015;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = Math.max(200, container.clientWidth || 320);
      const h = Math.max(100, container.clientHeight || 115);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const scene = sceneRef.current;
    if (!scene) return;

    if (activeGroupRef.current) {
      scene.remove(activeGroupRef.current);
      activeGroupRef.current = null;
    }

    buildCalibratedWeaponAssembly(spec.id, 0.78)
      .then((assembly) => {
        if (cancelled || !sceneRef.current || !assembly) return;
        assembly.rotation.z = 0.06;
        sceneRef.current.add(assembly);
        activeGroupRef.current = assembly;
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [spec.id]);

  const glbCfg = WEAPON_GLB_VISUAL_CONFIGS[spec.id];
  const manifestInfo = glbCfg
    ? ULTIMATE_GUNS_GLB_MANIFEST.find((m) => m.file === glbCfg.glbFile)
    : undefined;

  return (
    <div className="mb-3.5 rounded-2xl bg-zinc-900/90 border border-white/10 p-3 flex flex-col sm:flex-row items-center gap-3.5">
      <div
        ref={mountRef}
        className="w-full sm:w-64 h-28 rounded-xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-white/10 overflow-hidden shrink-0 relative"
      />
      <div className="flex-1 min-w-0 w-full">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/15 text-amber-300 border border-amber-400/30 shrink-0">
              Preview 3D GLB
            </span>
            <h3 className="text-sm font-black text-white truncate">{spec.name}</h3>
          </div>
          <span className="text-sm font-black font-mono text-amber-400 shrink-0">
            ${spec.price}
          </span>
        </div>

        <p className="text-xs text-zinc-300 line-clamp-1 mb-2">{spec.description}</p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-zinc-400">
          <span>
            Arquivo GLB:{' '}
            <strong className="text-zinc-200">{spec.glbModel || glbCfg?.glbFile}</strong>
          </span>
          {manifestInfo && (
            <span>
              Malha:{' '}
              <strong className="text-emerald-400">
                {manifestInfo.triangles} tris ({manifestInfo.vertices} vértices)
              </strong>
            </span>
          )}
          {spec.accessories && spec.accessories.length > 0 && (
            <span>
              Acessórios 3D:{' '}
              <strong className="text-sky-300">{spec.accessories.join(' + ')}</strong>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
