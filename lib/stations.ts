export interface StationData {
  id: string;
  name: string;
  subtitle?: string;
  type: 'sign-on' | 'about' | 'project' | 'contact';
  skills?: string[];
  demoComponent?: string;
}

export const stations: StationData[] = [
  {
    id: 'sign-on',
    name: 'VENUGOPALAM CHUKKA',
    subtitle: 'Creative Frontend Engineering',
    type: 'sign-on',
  },
  {
    id: 'about',
    name: 'ABOUT',
    subtitle: 'Interactive Systems Builder',
    type: 'about',
    skills: [
      'TypeScript',
      'React',
      'Next.js',
      'Node.js',
      'Three.js',
      'WebGL',
      'GLSL',
      'Tailwind CSS',
      'Framer Motion',
      'PostgreSQL',
      'Redis',
      'Docker',
      'AWS',
      'GraphQL',
      'Rust',
      'Python',
    ],
  },
  {
    id: 'demo-spring',
    name: 'SPRING PHYSICS',
    subtitle: 'Weight & Momentum',
    type: 'project',
    demoComponent: 'SpringPhysicsDemo',
  },
  {
    id: 'demo-shaders',
    name: 'SHADERS',
    subtitle: 'Live GLSL Distortion',
    type: 'project',
    demoComponent: 'ShaderDemo',
  },
  {
    id: 'demo-micro',
    name: 'MICRO-INTERACTIONS',
    subtitle: 'Tactile Feedback Loops',
    type: 'project',
    demoComponent: 'MicroInteractionsDemo',
  },
  {
    id: 'demo-kinetic',
    name: 'KINETIC TYPE',
    subtitle: 'Responsive Letter Dynamics',
    type: 'project',
    demoComponent: 'KineticTypeDemo',
  },
  {
    id: 'demo-scroll',
    name: 'SCROLL CHOREOGRAPHY',
    subtitle: 'Reactive Layout Assembly',
    type: 'project',
    demoComponent: 'ScrollChoreographyDemo',
  },
  {
    id: 'demo-particles',
    name: 'PARTICLES / CANVAS',
    subtitle: 'Interactive Particle Fields',
    type: 'project',
    demoComponent: 'ParticlesDemo',
  },
  {
    id: 'demo-3d',
    name: '3D GEOMETRY / R3F',
    subtitle: 'WebGL Geometry & Shaders',
    type: 'project',
    demoComponent: 'ThreeDDemo',
  },
  {
    id: 'contact',
    name: 'CONTACT',
    subtitle: 'Get in Touch',
    type: 'contact',
  },
];
