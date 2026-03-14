import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float, Environment, Billboard } from '@react-three/drei';

const SKILLS = [
  { name: 'React', pos: [2, 1, 0] },
  { name: 'Python', pos: [-2, 0.5, 1] },
  { name: 'Public Speaking', pos: [0, 2, -1] },
  { name: 'Photography', pos: [-1.5, -1, 0.5] },
  { name: 'UI Design', pos: [1.5, -0.5, -1] },
];

function SkillNode({ skill, position, onClick }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <Float speed={2} rotationIntensity={0.8} floatIntensity={1.2} position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => {
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[0.35, 64, 64]} />
        <meshPhysicalMaterial
          color={hovered ? '#00E5FF' : '#3FE0C5'}
          roughness={0.2}
          metalness={0.5}
          clearcoat={0.8}
          clearcoatRoughness={0.2}
          emissive={hovered ? '#00E5FF' : '#000000'}
          emissiveIntensity={hovered ? 0.4 : 0}
        />
      </mesh>
      <Billboard position={[0, -0.6, 0]}>
        <Text
          fontSize={0.2}
          color="#F8F9FA"
          anchorX="center"
          anchorY="middle"
          maxWidth={2}
        >
          {skill}
        </Text>
      </Billboard>
    </Float>
  );
}

export default function SkillMap({ onSkillSelect }) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10 bg-navy/80">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <pointLight position={[-10, -10, 5]} color="#00E5FF" intensity={2} />
          <pointLight position={[10, -10, 5]} color="#3FE0C5" intensity={1} />
          <Environment preset="city" />
          {SKILLS.map((s) => (
            <SkillNode key={s.name} skill={s.name} position={s.pos} onClick={() => onSkillSelect?.(s.name)} />
          ))}
          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            autoRotate={true}
            autoRotateSpeed={1.5}
            enableDamping={true}
            dampingFactor={0.05}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
