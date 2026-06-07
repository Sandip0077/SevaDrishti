import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

function Globe3D() {
  const meshRef = useRef();
  const pointsRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002;
    }
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
    }
  });

  // Create points on the sphere surface to represent zones
  const points = useMemo(() => {
    const pts = [];
    const zonePositions = [
      { lat: 25.4358, lng: 81.8463 }, // Prayagraj center
      { lat: 25.4500, lng: 81.8300 },
      { lat: 25.4200, lng: 81.8600 },
      { lat: 25.4400, lng: 81.8700 },
      { lat: 25.4600, lng: 81.8500 },
      { lat: 25.4100, lng: 81.8400 },
      { lat: 25.4550, lng: 81.8200 },
      { lat: 25.4300, lng: 81.8800 },
    ];

    zonePositions.forEach(({ lat, lng }) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      const x = -1.52 * Math.sin(phi) * Math.cos(theta);
      const y = 1.52 * Math.cos(phi);
      const z = 1.52 * Math.sin(phi) * Math.sin(theta);
      pts.push(new THREE.Vector3(x, y, z));
    });
    return pts;
  }, []);

  const particlePositions = useMemo(() => {
    const positions = new Float32Array(200 * 3);
    for (let i = 0; i < 200; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return positions;
  }, []);

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 3, 5]} intensity={1} color="#fff7ed" />
      <directionalLight position={[-3, -2, -5]} intensity={0.3} color="#dbeafe" />

      {/* Globe */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <group ref={meshRef}>
          {/* Main sphere */}
          <Sphere args={[1.5, 64, 64]}>
            <meshPhongMaterial
              color="#2563EB"
              transparent
              opacity={0.15}
              wireframe={false}
            />
          </Sphere>

          {/* Wireframe overlay */}
          <Sphere args={[1.51, 32, 32]}>
            <meshBasicMaterial
              color="#3B82F6"
              wireframe
              transparent
              opacity={0.08}
            />
          </Sphere>

          {/* Glow sphere */}
          <Sphere args={[1.55, 32, 32]}>
            <meshBasicMaterial
              color="#F97316"
              transparent
              opacity={0.04}
            />
          </Sphere>

          {/* Zone dots */}
          {points.map((point, i) => (
            <mesh key={i} position={point}>
              <sphereGeometry args={[0.035, 16, 16]} />
              <meshBasicMaterial color="#F97316" />
            </mesh>
          ))}
        </group>
      </Float>

      {/* Background particles */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={200}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.015}
          color="#94A3B8"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI / 1.5}
        minPolarAngle={Math.PI / 3}
      />
    </>
  );
}

export default function HeroGlobe() {
  return (
    <div style={{
      width: '100%',
      height: '500px',
      position: 'relative',
    }}>
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        style={{ background: 'transparent' }}
        gl={{ alpha: true, antialias: true }}
      >
        <Globe3D />
      </Canvas>

      {/* Glow effect behind globe */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '300px',
        height: '300px',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(59, 130, 246, 0.06) 50%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: -1,
      }} />
    </div>
  );
}
