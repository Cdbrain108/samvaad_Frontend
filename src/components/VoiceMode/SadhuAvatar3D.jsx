import { useEffect, useRef, useState } from 'react';
import { AVATAR_COLORS as COLOR, AVATAR_PROPORTIONS as SIZE, AVATAR_MOTION as MOTION } from './sadhuAvatarConfig';

/**
 * Procedurally generated, code-only 3D sadhu figure (no external mesh/likeness file).
 * This is a stylized, generic meditative representation — not a likeness of any real
 * person — consistent with Samvaad's "AI-generated representation" disclosure.
 *
 * To reshape or recolor the avatar, edit `sadhuAvatarConfig.js` instead of this file.
 *
 * Rendering only runs while mounted (Voice Mode open) and pauses on tab hide,
 * keeping the feature lightweight per the project's performance requirements.
 */
export default function SadhuAvatar3D({ state = 'idle', pulseTick = 0 }) {
  const containerRef = useRef(null);
  const sceneRef = useRef({});
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    let disposed = false;

    (async () => {
      let THREE;
      try {
        THREE = await import('three');
      } catch {
        setSupported(false);
        return;
      }
      if (disposed || !containerRef.current) return;

      const container = containerRef.current;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      } catch {
        setSupported(false);
        return;
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      container.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
      camera.position.set(0, SIZE.cameraHeight, SIZE.cameraDistance);
      camera.lookAt(0, SIZE.cameraLookAtY, 0);

      scene.add(new THREE.AmbientLight(COLOR.lightAmbient, 0.75));
      const key = new THREE.DirectionalLight(COLOR.lightKey, 1.1);
      key.position.set(2.2, 3.4, 3.2);
      scene.add(key);
      const rim = new THREE.DirectionalLight(COLOR.lightRim, 0.4);
      rim.position.set(-2.5, 1.6, -2);
      scene.add(rim);

      const sadhu = new THREE.Group();
      scene.add(sadhu);

      // Robe: silhouette of a seated meditative figure via a lathe profile.
      // The top point leaves a small open radius so the neck can pass through it.
      const robeProfile = [
        [0.92, 0.0], [0.88, 0.16], [0.62, 0.52], [0.56, 0.92],
        [0.7, 1.32], [0.5, 1.72], [0.27, 1.9], [SIZE.robeNeckOpeningRadius, 1.98],
      ].map(([x, y]) => new THREE.Vector2(x, y));
      const robe = new THREE.Mesh(
        new THREE.LatheGeometry(robeProfile, 40),
        new THREE.MeshStandardMaterial({ color: COLOR.robe, roughness: 0.85, metalness: 0.02, side: THREE.DoubleSide })
      );
      sadhu.add(robe);

      const seat = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 1.15, 0.08, 40),
        new THREE.MeshStandardMaterial({ color: COLOR.seat, roughness: 0.9 })
      );
      seat.position.y = -0.02;
      sadhu.add(seat);

      // Neck: bridges the robe's collar opening and the head so the figure
      // doesn't look like a head glued directly onto the robe.
      const neck = new THREE.Mesh(
        new THREE.CylinderGeometry(SIZE.neckTopRadius, SIZE.neckBottomRadius, SIZE.neckHeight, 16),
        new THREE.MeshStandardMaterial({ color: COLOR.skin, roughness: 0.75 })
      );
      neck.position.y = SIZE.neckY;
      sadhu.add(neck);

      // Resting hands (simple mudra pose) — makes the seated/meditating read instant.
      const handMaterial = new THREE.MeshStandardMaterial({ color: COLOR.skin, roughness: 0.75 });
      const handGeometry = new THREE.SphereGeometry(SIZE.handRadius, 14, 14);
      const [handY, handZ] = SIZE.handPosition;
      const handL = new THREE.Mesh(handGeometry, handMaterial);
      handL.position.set(-SIZE.handOffsetX, handY, handZ);
      handL.scale.set(1, 0.75, 0.85);
      const handR = handL.clone();
      handR.position.x = SIZE.handOffsetX;
      sadhu.add(handL, handR);

      const headGroup = new THREE.Group();
      headGroup.position.y = SIZE.headY;
      sadhu.add(headGroup);

      const head = new THREE.Mesh(
        new THREE.SphereGeometry(SIZE.headRadius, 24, 24),
        new THREE.MeshStandardMaterial({ color: COLOR.skin, roughness: 0.75 })
      );
      headGroup.add(head);

      // Top-knot (jata): small, rounded, sits high — reads as a bun, not a flat cap.
      const bun = new THREE.Mesh(
        new THREE.SphereGeometry(SIZE.bunRadius, 16, 16),
        new THREE.MeshStandardMaterial({ color: COLOR.hairBun, roughness: 1, flatShading: true })
      );
      bun.position.set(...SIZE.bunPosition);
      bun.scale.set(...SIZE.bunScale);
      headGroup.add(bun);

      // A thin hair band at the crown connects the bun to the head naturally.
      const crownBand = new THREE.Mesh(
        new THREE.SphereGeometry(SIZE.headRadius * 0.98, 20, 20, 0, Math.PI * 2, 0, Math.PI * 0.42),
        new THREE.MeshStandardMaterial({ color: COLOR.hairBun, roughness: 1, flatShading: true })
      );
      crownBand.position.set(0, 0.02, 0);
      headGroup.add(crownBand);

      // Beard: narrow and elongated so it hangs distinctly from the chin
      // instead of reading as a flat collar across the shoulders.
      const [beardRadius, beardHeight] = SIZE.beardSize;
      const beard = new THREE.Mesh(
        new THREE.ConeGeometry(beardRadius, beardHeight, 16, 1, true),
        new THREE.MeshStandardMaterial({ color: COLOR.beard, roughness: 1, flatShading: true, side: THREE.DoubleSide })
      );
      beard.rotation.x = Math.PI;
      beard.position.set(...SIZE.beardPosition);
      headGroup.add(beard);

      // Mustache bridges the beard to just under the nose.
      const mustache = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.05, 0.05),
        new THREE.MeshStandardMaterial({ color: COLOR.beard, roughness: 1, flatShading: true })
      );
      mustache.position.set(0, -0.06, 0.4);
      headGroup.add(mustache);

      const tilakDot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 10), new THREE.MeshStandardMaterial({ color: COLOR.tilakDot }));
      tilakDot.position.set(0, 0.12, 0.4);
      headGroup.add(tilakDot);
      const tilakStripe = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.22, 0.02),
        new THREE.MeshStandardMaterial({ color: COLOR.tilakStripe, roughness: 0.6 })
      );
      tilakStripe.position.set(0, 0.24, 0.39);
      headGroup.add(tilakStripe);

      const [eyeY, eyeZ] = SIZE.eyePosition;
      const eyeGeometry = new THREE.SphereGeometry(SIZE.eyeRadius, 10, 10);
      const eyeMaterial = new THREE.MeshStandardMaterial({ color: COLOR.eyes, roughness: 0.4 });
      const eyeL = new THREE.Mesh(eyeGeometry, eyeMaterial);
      eyeL.position.set(-SIZE.eyeSpacing, eyeY, eyeZ);
      const eyeR = eyeL.clone();
      eyeR.position.x = SIZE.eyeSpacing;
      headGroup.add(eyeL, eyeR);

      // Resting mouth: a gentle smile arc, always visible at rest.
      const mouthMaterial = new THREE.MeshStandardMaterial({ color: COLOR.mouth, roughness: 0.6 });
      const mouthSmile = new THREE.Mesh(
        new THREE.TorusGeometry(SIZE.mouthSmileRadius, SIZE.mouthSmileTube, 8, 20, Math.PI),
        mouthMaterial
      );
      mouthSmile.rotation.z = Math.PI;
      mouthSmile.position.set(...SIZE.mouthSmilePosition);
      headGroup.add(mouthSmile);

      // Speaking mouth: hidden at rest, scales open while speaking.
      const mouthOpen = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 12), mouthMaterial);
      mouthOpen.position.set(...SIZE.mouthOpenPosition);
      mouthOpen.scale.set(1, SIZE.mouthOpenBaseScale, 0.5);
      headGroup.add(mouthOpen);

      const malaMaterial = new THREE.MeshStandardMaterial({ color: COLOR.mala, roughness: 0.9 });
      const malaGeometry = new THREE.SphereGeometry(0.045, 8, 8);
      const mala = new THREE.InstancedMesh(malaGeometry, malaMaterial, SIZE.malaBeadCount);
      const malaMatrix = new THREE.Matrix4();
      for (let i = 0; i < SIZE.malaBeadCount; i += 1) {
        const angle = (i / SIZE.malaBeadCount) * Math.PI * 2;
        malaMatrix.setPosition(
          Math.sin(angle) * SIZE.malaRadius,
          1.62 + Math.cos(angle) * 0.08,
          0.2 + Math.cos(angle) * 0.12
        );
        mala.setMatrixAt(i, malaMatrix);
      }
      sadhu.add(mala);

      const halo = new THREE.Mesh(
        new THREE.TorusGeometry(SIZE.haloRadius, SIZE.haloTubeThickness, 12, 48),
        new THREE.MeshStandardMaterial({ color: COLOR.haloRing, emissive: COLOR.haloGlow, emissiveIntensity: 0.6, roughness: 0.4 })
      );
      halo.position.set(...SIZE.haloPosition);
      headGroup.add(halo);

      let frame = 0;
      let lastPulse = pulseTick;
      let mouthPulse = 0;
      let blinkTimer = MOTION.blinkMinDelay + Math.random() * (MOTION.blinkMaxDelay - MOTION.blinkMinDelay);
      let visible = !document.hidden;
      const onVisibility = () => { visible = !document.hidden; };
      document.addEventListener('visibilitychange', onVisibility);

      const resize = () => {
        const { clientWidth, clientHeight } = container;
        if (!clientWidth || !clientHeight) return;
        camera.aspect = clientWidth / clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(clientWidth, clientHeight, false);
      };
      resize();
      const observer = new ResizeObserver(resize);
      observer.observe(container);

      let raf = 0;
      const clock = new THREE.Clock();

      const animate = () => {
        raf = requestAnimationFrame(animate);
        if (!visible) return;
        const dt = clock.getDelta();
        frame += dt;

        const currentState = sceneRef.current.state || 'idle';
        const isSpeaking = currentState === 'speaking';
        const isThinking = currentState === 'thinking';
        const isPaused = currentState === 'paused';

        sadhu.position.y = Math.sin(frame * (isThinking ? MOTION.thinkingBobSpeed : MOTION.idleBobSpeed)) * MOTION.idleBobAmount;
        headGroup.rotation.y = Math.sin(frame * MOTION.headSwaySpeed) * (isThinking ? MOTION.headSwayAmount * 2.25 : MOTION.headSwayAmount);
        headGroup.rotation.z = Math.sin(frame * 0.4) * 0.015;

        if (sceneRef.current.pulseTick !== lastPulse) {
          lastPulse = sceneRef.current.pulseTick;
          mouthPulse = 1;
        }
        mouthPulse *= 0.82;

        if (isSpeaking && !isPaused) {
          const talk = Math.abs(Math.sin(frame * MOTION.talkFrequency)) * MOTION.talkBaseAmount + mouthPulse * MOTION.talkPulseAmount;
          mouthOpen.scale.y = SIZE.mouthOpenBaseScale + talk;
          mouthSmile.visible = talk < 0.12;
          halo.material.emissiveIntensity = MOTION.haloSpeakingIntensity + Math.sin(frame * MOTION.haloPulseSpeed) * 0.25;
          halo.scale.setScalar(1 + Math.sin(frame * MOTION.haloPulseSpeed) * 0.03);
        } else {
          mouthOpen.scale.y = isPaused ? SIZE.mouthOpenBaseScale + 0.1 : SIZE.mouthOpenBaseScale;
          mouthSmile.visible = !isPaused;
          halo.material.emissiveIntensity = isThinking ? MOTION.haloThinkingIntensity + Math.sin(frame * 3) * 0.2 : MOTION.haloIdleIntensity;
          halo.scale.setScalar(1);
        }

        blinkTimer -= dt;
        if (blinkTimer <= 0) {
          blinkTimer = MOTION.blinkMinDelay + Math.random() * (MOTION.blinkMaxDelay - MOTION.blinkMinDelay);
        }
        const blinkPhase = blinkTimer < MOTION.blinkDuration ? 1 - blinkTimer / MOTION.blinkDuration : 0;
        const eyeScale = 1 - Math.min(1, blinkPhase) * 0.92;
        eyeL.scale.y = eyeScale;
        eyeR.scale.y = eyeScale;

        renderer.render(scene, camera);
      };
      animate();

      sceneRef.current = { renderer, observer, cleanup: () => {
        cancelAnimationFrame(raf);
        document.removeEventListener('visibilitychange', onVisibility);
        observer.disconnect();
        scene.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            const materials = Array.isArray(object.material) ? object.material : [object.material];
            materials.forEach((material) => material.dispose());
          }
        });
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      }, state, pulseTick };
    })();

    return () => {
      disposed = true;
      sceneRef.current.cleanup?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    sceneRef.current.state = state;
    sceneRef.current.pulseTick = pulseTick;
  }, [state, pulseTick]);

  if (!supported) {
    return <span className="voice-avatar-mark" aria-hidden="true">ॐ</span>;
  }

  return <div className="voice-avatar-3d" ref={containerRef} role="img" aria-label="Guruji speaking avatar, an AI-generated stylized representation" />;
}
