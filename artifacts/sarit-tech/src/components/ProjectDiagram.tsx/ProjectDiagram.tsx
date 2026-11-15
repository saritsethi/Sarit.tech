import type { ReactNode } from 'react';

// Inline SVG diagrams for the Projects page (/builder).
// Each diagram is a clean 3-step flow drawn in code — no raster images —
// so the text stays crisp at any size. Colours match the site's dark theme:
// charcoal background, teal (#2dd4bf) accent, white step titles and muted
// step detail text. Only the three slugs below get a diagram; the SARTH(A)i
// card keeps its video and is never routed here.

type DiagramStep = {
  title: string;
  line1: string;
  line2: string;
  icon: ReactNode;
};

const FONT = 'Manrope, Inter, ui-sans-serif, system-ui, sans-serif';
const TEAL = '#2dd4bf';
const INK = '#0a0f1e';
const CARD_FILL = '#16213a';
const TITLE_FILL = '#ffffff';
const DETAIL_FILL = '#94a3b8';

function FlowStep({ x, index, step }: { x: number; index: number; step: DiagramStep }) {
  const cx = x + 110;
  return (
    <g>
      <rect x={x} y={88} width={220} height={272} rx={16} fill={CARD_FILL} stroke={TEAL} strokeOpacity={0.25} />
      <circle cx={cx} cy={150} r={27} fill={TEAL} />
      <text x={cx} y={160} textAnchor="middle" fontSize={27} fontWeight={700} fill={INK} fontFamily={FONT}>
        {index + 1}
      </text>
      <g
        transform={`translate(${cx - 22} 192)`}
        stroke={TEAL}
        strokeWidth={4}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {step.icon}
      </g>
      <text x={cx} y={288} textAnchor="middle" fontSize={23} fontWeight={700} fill={TITLE_FILL} fontFamily={FONT}>
        {step.title}
      </text>
      <text x={cx} y={320} textAnchor="middle" fontSize={19} fill={DETAIL_FILL} fontFamily={FONT}>
        {step.line1}
      </text>
      <text x={cx} y={344} textAnchor="middle" fontSize={19} fill={DETAIL_FILL} fontFamily={FONT}>
        {step.line2}
      </text>
    </g>
  );
}

function FlowArrow({ x }: { x: number }) {
  return (
    <polyline
      points={`${x},212 ${x + 16},228 ${x},244`}
      fill="none"
      stroke={TEAL}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}

function Diagram({ label, steps }: { label: string; steps: [DiagramStep, DiagramStep, DiagramStep] }) {
  return (
    <svg
      viewBox="0 0 800 450"
      className="absolute inset-0 h-full w-full"
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width={800} height={450} fill="#0d1526" />
      <text x={400} y={52} textAnchor="middle" fontSize={19} fontWeight={600} letterSpacing={5} fill={TEAL} fontFamily={FONT}>
        HOW IT WORKS
      </text>
      <FlowStep x={40} index={0} step={steps[0]} />
      <FlowArrow x={262} />
      <FlowStep x={290} index={1} step={steps[1]} />
      <FlowArrow x={512} />
      <FlowStep x={540} index={2} step={steps[2]} />
    </svg>
  );
}

// Icons are drawn in a 44 x 44 box, stroked in teal.
const chatIcon: ReactNode = (
  <>
    <path d="M6 8a4 4 0 0 1 4-4h24a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H20l-8 8v-8h-2a4 4 0 0 1-4-4z" />
    <path d="M14 15h16M14 21h10" />
  </>
);

const eyeIcon: ReactNode = (
  <>
    <path d="M2 22s7-11 20-11 20 11 20 11-7 11-20 11S2 22 2 22z" />
    <circle cx={22} cy={22} r={5} />
  </>
);

const targetIcon: ReactNode = (
  <>
    <circle cx={22} cy={22} r={16} />
    <circle cx={22} cy={22} r={7} />
    <circle cx={22} cy={22} r={1.5} fill={TEAL} stroke="none" />
  </>
);

const checklistIcon: ReactNode = (
  <>
    <rect x={8} y={4} width={28} height={36} rx={4} />
    <path d="M14 16l3 3 5-6" />
    <path d="M14 28l3 3 5-6" />
  </>
);

const barsIcon: ReactNode = (
  <>
    <path d="M8 36V26M20 36V16M32 36V10" />
    <path d="M6 38h32" />
  </>
);

const houseIcon: ReactNode = (
  <>
    <path d="M5 23l17-14 17 14" />
    <path d="M10 21v13h24V21" />
    <path d="M19 34v-8h6v8" />
  </>
);

const slidersIcon: ReactNode = (
  <>
    <path d="M6 12h32M6 22h32M6 32h32" />
    <circle cx={15} cy={12} r={4.5} fill={CARD_FILL} />
    <circle cx={29} cy={22} r={4.5} fill={CARD_FILL} />
    <circle cx={19} cy={32} r={4.5} fill={CARD_FILL} />
  </>
);

const planeIcon: ReactNode = (
  <>
    <path d="M4 22l36-14-12 32-8-12z" />
    <path d="M20 28l20-20" />
  </>
);

const gridIcon: ReactNode = (
  <>
    <rect x={6} y={6} width={13} height={13} rx={2} />
    <rect x={25} y={6} width={13} height={13} rx={2} />
    <rect x={6} y={25} width={13} height={13} rx={2} />
    <rect x={25} y={25} width={13} height={13} rx={2} />
  </>
);

const DIAGRAMS: Record<string, { label: string; steps: [DiagramStep, DiagramStep, DiagramStep] }> = {
  cricketiq: {
    label: 'How CricketIQ works: share your game, analyse the play, get coaching.',
    steps: [
      { title: 'Share your game', line1: 'Chat, photo', line2: 'or video', icon: chatIcon },
      { title: 'Analyze the play', line1: 'RAG + vision on', line2: 'real match data', icon: eyeIcon },
      { title: 'Get coaching', line1: 'Expert feedback', line2: 'by chat & voice', icon: targetIcon },
    ],
  },
  homedecider: {
    label: 'How HomeDecider works: answer the quiz, score the homes, see your day.',
    steps: [
      { title: 'Answer the quiz', line1: 'Lifestyle', line2: '& budget', icon: checklistIcon },
      { title: 'Score the homes', line1: 'Live FRED', line2: 'market data', icon: barsIcon },
      { title: 'See your day', line1: 'Cafés, schools', line2: '& more nearby', icon: houseIcon },
    ],
  },
  'job-application-agent': {
    label: 'How the Job Application Agent works: set criteria, the agent applies, track it all.',
    steps: [
      { title: 'Set criteria', line1: 'Roles, skills', line2: '& preferences', icon: slidersIcon },
      { title: 'Agent applies', line1: 'Finds, scores &', line2: 'tailors applications', icon: planeIcon },
      { title: 'Track it all', line1: 'One dashboard', line2: '+ email digest', icon: gridIcon },
    ],
  },
};

export default function ProjectDiagram({ slug }: { slug: string | null }) {
  if (!slug) return null;
  const diagram = DIAGRAMS[slug];
  if (!diagram) return null;
  return <Diagram label={diagram.label} steps={diagram.steps} />;
}
