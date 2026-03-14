import { Canvas, useFrame } from '@react-three/fiber';
import { Float, RoundedBox } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';

const featureCards = [
  {
    eyebrow: 'Discovery',
    title: 'Skill graph that feels alive',
    body: 'Browse peer tutors through layered cards, active-session signals, and faster skill matching.',
  },
  {
    eyebrow: 'Booking',
    title: 'Frictionless scheduling',
    body: 'Move from interest to confirmed slot without losing context between discovery, profile, and session flow.',
  },
  {
    eyebrow: 'Live',
    title: 'Session-ready from the first click',
    body: 'The interface keeps momentum high with live availability, responsive actions, and immersive spatial feedback.',
  },
];

const statCards = [
  { value: '120+', label: 'peer mentors ready' },
  { value: '15m', label: 'to first booked session' },
  { value: '4.9/5', label: 'average session rating' },
];

const chips = ['Design systems', 'Data viz', 'React', 'Python', 'Career prep'];

function FloatingShape({ position, rotation, color, scale = 1, speed = 1 }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = rotation[0] + Math.sin(state.clock.elapsedTime * speed) * 0.18;
    ref.current.rotation.y = rotation[1] + state.clock.elapsedTime * 0.14 * speed;
    ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.22;
  });

  return (
    <Float speed={2 * speed} rotationIntensity={0.45} floatIntensity={0.7}>
      <RoundedBox ref={ref} args={[1.25, 1.25, 0.15]} radius={0.18} smoothness={4} position={position} scale={scale}>
        <meshStandardMaterial color={color} metalness={0.55} roughness={0.18} />
      </RoundedBox>
    </Float>
  );
}

function OrbitalRing({ radius, color, speed, offset, opacity = 0.7 }) {
  const ref = useRef(null);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.z = state.clock.elapsedTime * speed + offset;
    ref.current.rotation.x = Math.PI / 2.8;
    ref.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.12) * 0.16;
  });

  return (
    <group ref={ref}>
      <mesh>
        <torusGeometry args={[radius, 0.035, 18, 120]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.22} transparent opacity={opacity} />
      </mesh>
    </group>
  );
}

function HeroScene() {
  return (
    <Canvas camera={{ position: [0, 0, 7], fov: 48 }} dpr={[1, 1.5]}>
      <color attach="background" args={['#07111f']} />
      <fog attach="fog" args={['#07111f', 6, 14]} />
      <ambientLight intensity={0.95} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} color="#8eeeff" />
      <pointLight position={[-4, -2, 3]} intensity={1.8} color="#6f7cff" />
      <pointLight position={[4, 1, 2]} intensity={1.4} color="#3fe0c5" />

      <group position={[1.25, -0.15, -1.2]}>
        <OrbitalRing radius={1.45} color="#00e5ff" speed={0.25} offset={0.3} opacity={0.5} />
        <OrbitalRing radius={2.1} color="#7a7cff" speed={-0.17} offset={1.6} opacity={0.4} />
        <OrbitalRing radius={2.75} color="#8df1ff" speed={0.11} offset={2.3} opacity={0.2} />
      </group>

      <FloatingShape position={[-2.4, 1.4, -1]} rotation={[0.8, 0.5, 0.2]} color="#9ff7ff" scale={0.72} speed={0.8} />
      <FloatingShape position={[2.55, -1.25, -0.35]} rotation={[0.35, 0.7, -0.4]} color="#5f67ff" scale={0.95} speed={1.05} />
      <FloatingShape position={[0.85, 2.05, -2.15]} rotation={[1.1, 0.1, 0.5]} color="#3fe0c5" scale={0.55} speed={0.65} />

      <mesh position={[-1.8, -2.05, -3]} rotation={[-0.5, 0.8, 0.2]}>
        <octahedronGeometry args={[0.72, 0]} />
        <meshStandardMaterial color="#ff7e6b" emissive="#ff7e6b" emissiveIntensity={0.18} metalness={0.22} roughness={0.24} />
      </mesh>

      <mesh position={[0, -2.6, -3.1]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[6, 48]} />
        <meshBasicMaterial color="#10253e" transparent opacity={0.6} />
      </mesh>
    </Canvas>
  );
}

function MagneticButton({ to, children, variant = 'primary' }) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [ripples, setRipples] = useState([]);

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 14;
    setOffset({ x, y });
  };

  const handleLeave = () => setOffset({ x: 0, y: 0 });

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const ripple = {
      id: Date.now(),
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };

    setRipples((current) => [...current, ripple]);
    window.setTimeout(() => {
      setRipples((current) => current.filter((item) => item.id !== ripple.id));
    }, 650);
  };

  const className =
    variant === 'primary'
      ? 'bg-cyan text-navy shadow-[0_18px_60px_rgba(0,229,255,0.28)] hover:bg-[#94f5ff]'
      : 'border border-white/15 bg-white/6 text-white/90 hover:border-cyan/35 hover:bg-white/10';

  return (
    <Link
      to={to}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      className={`interactive-button relative overflow-hidden rounded-[1.2rem] px-7 py-4 text-base font-semibold backdrop-blur-xl transition duration-300 ${className}`}
      style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
    >
      <span className="relative z-10">{children}</span>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="button-ripple"
          style={{ left: ripple.x, top: ripple.y }}
        />
      ))}
    </Link>
  );
}

function TiltCard({ children, className = '' }) {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 12;
    setTilt({ x, y });
  };

  const handleLeave = () => setTilt({ x: 0, y: 0 });

  return (
    <div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{ transform: `perspective(1400px) rotateX(${-tilt.y}deg) rotateY(${tilt.x}deg)` }}
    >
      {children}
    </div>
  );
}

function FloatingDock() {
  return (
    <div className="floating-dock">
      {chips.map((chip) => (
        <button key={chip} type="button" className="floating-chip">
          {chip}
        </button>
      ))}
    </div>
  );
}

function DepthPhone({ pointer }) {
  const rotateX = THREE.MathUtils.clamp(-pointer.y * 7, -9, 9);
  const rotateY = THREE.MathUtils.clamp(pointer.x * 10, -12, 12);

  return (
    <div
      className="relative mx-auto w-full max-w-[31rem] preserve-3d"
      style={{ transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)` }}
    >
      <div className="depth-phone-shell">
        <div className="depth-phone-screen">
          <div className="depth-phone-glow" />

          <div
            className="depth-layer depth-layer-back"
            style={{ transform: `translate3d(${pointer.x * -10}px, ${pointer.y * -10}px, -55px)` }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,_rgba(255,255,255,0.24),_transparent_24%),linear-gradient(180deg,_rgba(34,52,88,0.95),_rgba(7,17,31,0.98)_58%,_rgba(2,6,12,1))]" />
            <div className="absolute inset-x-10 top-20 h-32 rounded-full bg-cyan/12 blur-[90px]" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-[linear-gradient(180deg,_transparent,_rgba(0,229,255,0.08)_50%,_transparent)]" />
          </div>

          <div
            className="depth-layer depth-layer-mid"
            style={{ transform: `translate3d(${pointer.x * -6}px, ${pointer.y * -6}px, 0px)` }}
          >
            <div className="absolute left-6 top-8 rounded-full border border-white/12 bg-white/10 px-4 py-1 text-[0.68rem] uppercase tracking-[0.36em] text-white/75 backdrop-blur-md">
              Campus match
            </div>

            <div className="absolute left-6 right-6 top-24 rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-md">
              <p className="text-[0.68rem] uppercase tracking-[0.34em] text-cyan/82">Today</p>
              <h3 className="mt-3 text-3xl font-bold leading-none text-white">Find the right tutor in minutes</h3>
              <p className="mt-3 max-w-[14rem] text-sm leading-6 text-white/60">
                Search, compare, and jump into sessions with less friction.
              </p>
            </div>

            <div className="absolute inset-x-6 bottom-6 grid gap-3">
              <div className="rounded-[1.6rem] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[0.64rem] uppercase tracking-[0.34em] text-white/48">Now booking</p>
                    <p className="mt-2 text-sm font-semibold text-white">React UI deep dive</p>
                  </div>
                  <span className="rounded-full bg-cyan/18 px-3 py-1 text-xs text-cyan">8 seats left</span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_auto] gap-3">
                <div className="rounded-[1.45rem] border border-cyan/25 bg-cyan/10 p-4 text-white shadow-[0_18px_50px_rgba(0,229,255,0.14)]">
                  <p className="text-[0.64rem] uppercase tracking-[0.34em] text-cyan/78">Depth</p>
                  <p className="mt-2 text-lg font-semibold">3 active study circles</p>
                </div>
                <div className="rounded-[1.45rem] border border-white/10 bg-white/[0.08] p-4 text-right">
                  <p className="text-[0.64rem] uppercase tracking-[0.34em] text-white/45">Live</p>
                  <p className="mt-2 text-2xl font-bold text-white">92%</p>
                </div>
              </div>
            </div>
          </div>

          <div
            className="depth-layer depth-layer-front"
            style={{ transform: `translate3d(${pointer.x * 14}px, ${pointer.y * 14}px, 70px)` }}
          >
            <div className="absolute right-[-1.2rem] top-28 rounded-[1.45rem] border border-white/14 bg-[#f8f9fa] px-4 py-3 text-navy shadow-[0_26px_60px_rgba(7,17,31,0.34)]">
              <p className="text-[0.62rem] uppercase tracking-[0.35em] text-navy/45">Next up</p>
              <p className="mt-2 text-sm font-semibold">Systems sprint</p>
              <p className="text-xs text-navy/55">Starts in 18 min</p>
            </div>

            <div className="absolute left-[-1.4rem] top-1/2 rounded-[1.35rem] border border-white/10 bg-white/[0.08] px-4 py-3 text-white shadow-[0_24px_60px_rgba(0,0,0,0.28)] backdrop-blur-xl">
              <p className="text-[0.62rem] uppercase tracking-[0.32em] text-cyan/74">Pulse</p>
              <p className="mt-2 text-sm font-medium">2 tutors joined just now</p>
            </div>

            <div className="absolute left-1/2 top-8 h-24 w-24 -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />
          </div>
        </div>
        <div className="depth-phone-notch" />
      </div>
    </div>
  );
}

export default function Landing() {
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMove = (event) => {
      const x = event.clientX / window.innerWidth - 0.5;
      const y = event.clientY / window.innerHeight - 0.5;
      setPointer({ x, y });
    };

    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07111f] text-white">
      <div className="absolute inset-0">
        <HeroScene />
      </div>
      <div className="landing-grid absolute inset-0 opacity-30" />
      <div className="landing-vignette absolute inset-0" />
      <div
        className="pointer-spotlight absolute inset-0"
        style={{
          background: `radial-gradient(circle at ${50 + pointer.x * 40}% ${32 + pointer.y * 30}%, rgba(0,229,255,0.14), transparent 22%), radial-gradient(circle at ${66 + pointer.x * 24}% ${18 + pointer.y * 18}%, rgba(122,124,255,0.18), transparent 18%)`,
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 pb-12 pt-6 md:px-10">
        <nav className="nav-shell flex items-center justify-between rounded-full border border-white/10 bg-white/5 px-5 py-3 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="brand-mark flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan/16 text-lg font-bold text-cyan">
              C
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-cyan/72">Clario</p>
              <p className="text-xs text-white/52">Peer-to-peer campus learning</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login" className="rounded-full px-4 py-2 text-sm text-white/82 transition hover:bg-white/8 hover:text-white">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-full border border-cyan/30 bg-cyan px-5 py-2 text-sm font-semibold text-navy transition hover:scale-[1.02] hover:bg-[#8bf3ff]"
            >
              Join Clario
            </Link>
          </div>
        </nav>

        <section className="grid flex-1 items-center gap-14 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:py-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/70 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-cyan shadow-[0_0_18px_rgba(0,229,255,0.9)]" />
              More motion, better hierarchy, less friction
            </div>

            <h1 className="mt-8 text-5xl font-bold leading-[0.93] tracking-[-0.05em] text-white sm:text-6xl lg:text-[5.5rem]">
              Peer learning with
              <span className="bg-[linear-gradient(135deg,_#ffffff,_#7ef0ff_42%,_#8da2ff)] bg-clip-text text-transparent"> cinematic depth</span>
              and real-time energy.
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-8 text-white/72 sm:text-xl">
              Clario helps students find niche skills, book faster, and step into live sessions through a landing page
              that feels responsive, premium, and unmistakably interactive.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <MagneticButton to="/register">Start learning</MagneticButton>
              <MagneticButton to="/login" variant="secondary">
                Sign in to your campus
              </MagneticButton>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {chips.map((chip) => (
                <button key={chip} type="button" className="skill-pill">
                  {chip}
                </button>
              ))}
            </div>

            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {statCards.map((stat) => (
                <TiltCard key={stat.label} className="rounded-[1.6rem] border border-white/10 bg-white/6 p-5 backdrop-blur-xl transition duration-300 hover:border-cyan/26 hover:bg-white/9">
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm leading-6 text-white/62">{stat.label}</p>
                </TiltCard>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan/12 blur-[120px]" />
            <FloatingDock />
            <DepthPhone pointer={pointer} />
          </div>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {featureCards.map((card) => (
            <TiltCard
              key={card.title}
              className="group premium-panel rounded-[1.9rem] border border-white/10 bg-white/6 p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1"
            >
              <p className="text-[0.7rem] uppercase tracking-[0.34em] text-cyan/74">{card.eyebrow}</p>
              <h3 className="mt-4 text-2xl font-semibold leading-tight text-white">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/68">{card.body}</p>
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-white/42">Hover-reactive panel</span>
                <span className="feature-dot" />
              </div>
            </TiltCard>
          ))}
        </section>
      </div>
    </div>
  );
}
