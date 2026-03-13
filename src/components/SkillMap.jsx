import { Suspense, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';

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
    <group position={position}>
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial color={hovered ? '#00E5FF' : '#3FE0C5'} emissive={hovered ? '#00E5FF' : '#0B132B'} />
      </mesh>
      <Text
        position={[0, -0.6, 0]}
        fontSize={0.2}
        color="#F8F9FA"
        anchorX="center"
        anchorY="middle"
        maxWidth={2}
      >
        {skill}
      </Text>
    </group>
  );
}

export default function SkillMap({ onSkillSelect }) {
  return (
    <div className="w-full h-[400px] rounded-xl overflow-hidden border border-white/10 bg-navy/80">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <Suspense fallback={null}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <pointLight position={[-10, -10, 5]} color="#00E5FF" intensity={0.5} />
          {SKILLS.map((s) => (
            <SkillNode key={s.name} skill={s.name} position={s.pos} onClick={() => onSkillSelect?.(s.name)} />
          ))}
          <OrbitControls enableZoom={true} enablePan={false} />
        </Suspense>
      </Canvas>
    </div>
  );
}
