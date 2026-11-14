export type Lang = 'es' | 'en';

export const profile = {
  name: 'Roberto Mendoza',
  handle: 'rmendoza',
  email: 'roberto.cmp16@gmail.com',
  linkedin: 'https://www.linkedin.com/in/rc-mendoza',
  linkedinLabel: 'in/rc-mendoza',
  github: 'https://github.com/robcmp',
  githubLabel: 'github.com/robcmp',
};

export const ticker = [
  'react', 'vue', 'astro', 'typescript', 'nestjs', 'node', 'postgresql', 'prisma', 'kafka',
  'gcp', 'docker', 'github-actions', 'mcp', 'ai-agents', 'web-components', 'core-web-vitals',
];

export type Project = {
  slug: string;
  title: string;
  kind: string;
  summary: string;
  log: string[];
  stack: string[];
};

export type Commit = { hash: string; ref: string; period: string; role: string; company: string; msg: string };

type Dict = {
  meta: { title: string; description: string; ogAlt: string };
  nav: { work: string; stack: string; log: string; contact: string; label: string };
  ui: { motion: string; motionOn: string; motionOff: string };
  hero: {
    eyebrow: string;
    lines: [string, string, string];
    sub: string;
    ctaWork: string;
    ctaContact: string;
    status: string;
    torusCaption: string;
  };
  terminal: { cmd: string; out: string[] }[];
  metrics: { k: string; v: string }[];
  work: { eyebrow: string; title: string; note: string; status: string; projects: Project[] };
  stack: { eyebrow: string; title: string; groups: { dir: string; items: string[] }[] };
  log: { eyebrow: string; title: string; commits: Commit[]; edu: string[] };
  contact: { eyebrow: string; title: string; sub: string; copy: string; copied: string; available: string };
  footer: { built: string; top: string };
};

const projectBase = {
  budget: { slug: 'budget-for-both', title: 'Budget For Both', stack: ['vue-3', 'nestjs', 'prisma', 'postgresql', 'otel'] },
  wih: { slug: 'what-i-have', title: 'What I Have', stack: ['react-19', 'nestjs-11', 'mcp', 'tailwind-v4', 'docker'] },
  health: { slug: 'family-health', title: 'Family Health', stack: ['react-19', 'express', 'postgresql', 'tesseract.js', 'otel'] },
  flow: { slug: 'dailyflow', title: 'DailyFlow', stack: ['nestjs', 'react', 'playwright', 'bullmq', 'redis'] },
};

const commitsBase = [
  { hash: 'e7a1c04', ref: 'HEAD -> main', company: 'Entel', role: 'Frontend Engineer' },
  { hash: '5b39f2d', ref: '', company: 'Entel', role: 'Frontend Dev · Sr. UX/UI & Analytics' },
  { hash: '9c04e8a', ref: '', company: 'Multiplica Talent', role: 'Frontend Developer' },
  { hash: '31fd7b6', ref: '', company: 'Enacción Consultores', role: 'Full Stack Developer' },
  { hash: 'a82e510', ref: '', company: 'Schiappacasse', role: 'Development & Support Analyst' },
  { hash: '0d6c3e9', ref: 'tag: v1.0', company: 'Novaro Apps', role: 'Mobile Developer' },
];

export const t: Record<Lang, Dict> = {
  es: {
    meta: {
      title: 'Roberto Mendoza — Frontend & Full Stack Engineer',
      description:
        'Ingeniero de software en Santiago de Chile. 6 años construyendo plataformas web, design systems, APIs y productos con IA aplicada.',
      ogAlt: 'Tarjeta: Menos fricción. Más producto. Roberto Mendoza, Frontend & Full Stack Engineer, rm.byteforus.com',
    },
    nav: { work: 'proyectos', stack: 'stack', log: 'trayectoria', contact: 'contacto', label: 'Navegación principal' },
    ui: { motion: 'motion', motionOn: 'on', motionOff: 'off' },
    hero: {
      eyebrow: 'software engineer • santiago, cl • frontend · full stack · cloud · ia',
      lines: ['Menos fricción.', 'Más producto.', ''],
      sub: 'Construyo frontends rápidos y accesibles, y también lo que corre detrás: APIs, microservicios, despliegues en la nube y agentes de IA.',
      ctaWork: 'ver proyectos',
      ctaContact: 'contacto',
      status: 'abierto a nuevos desafíos',
      torusCaption: 'fig.01 — toroide ascii renderizado en vivo',
    },
    terminal: [
      { cmd: 'whoami', out: ['roberto mendoza — frontend engineer @ entel'] },
      { cmd: 'cat profile.yml', out: ['experiencia: 6+ años', 'mercados: [chile, perú]', 'foco: [frontend, full-stack, cloud, ia-aplicada]'] },
      { cmd: 'ls ~/projects', out: ['budget-for-both  what-i-have  family-health  dailyflow'] },
    ],
    metrics: [
      { k: 'uptime', v: '6+ años' },
      { k: 'equipo', v: 'Entel CL · PE' },
      { k: 'tests', v: '~80% cobertura' },
      { k: 'deploy', v: 'gcp · docker · vps' },
    ],
    work: {
      eyebrow: 'proyectos',
      title: 'Procesos en ejecución',
      note: 'Productos propios, diseñados, construidos y desplegados de punta a punta en mi propio VPS.',
      status: 'en línea',
      projects: [
        {
          ...projectBase.budget,
          kind: 'finanzas · zero-knowledge',
          summary: 'Finanzas personales y en pareja. Los datos se cifran en el cliente: el servidor nunca ve tu información financiera.',
          log: ['cifrado en el cliente y llaves compartidas', 'ingesta de gastos desde correos', 'multi-moneda y opentelemetry'],
        },
        {
          ...projectBase.wih,
          kind: 'inventario · ia aplicada',
          summary: 'Inventario del hogar con lista de compras automática, operable por cualquier agente de IA compatible con MCP.',
          log: ['servidor mcp propio', 'ci con pruebas e2e', 'imágenes docker sin root'],
        },
        {
          ...projectBase.health,
          kind: 'salud · familia',
          summary: 'Seguimiento de salud familiar: lectura de exámenes con OCR, gráficos de evolución e informes en PDF.',
          log: ['ocr de exámenes con tesseract.js', 'informes pdf', 'health checks y observabilidad'],
        },
        {
          ...projectBase.flow,
          kind: 'automatización · día a día',
          summary: 'Sigue el transporte público y reserva automáticamente las clases del gimnasio.',
          log: ['bots con playwright', 'colas con bullmq y redis', 'monorepo pnpm'],
        },
      ],
    },
    stack: {
      eyebrow: 'stack',
      title: 'Árbol de dependencias',
      groups: [
        { dir: 'frontend', items: ['react', 'vue.js', 'astro', 'typescript', 'web-components', 'liquid · modyo'] },
        { dir: 'backend', items: ['node.js · nestjs', 'express', 'apis rest', 'postgresql · sql-server', 'prisma · firebase', 'kafka'] },
        { dir: 'cloud', items: ['gcp: cloud run, functions, build', 'docker', 'ci/cd · github actions', 'linux · vps'] },
        { dir: 'calidad', items: ['accesibilidad', 'design systems', 'seo técnico', 'core web vitals', 'jest · e2e'] },
        { dir: 'ia', items: ['ia generativa', 'agentes de ia', 'servidores mcp', 'harnesses de desarrollo'] },
      ],
    },
    log: {
      eyebrow: 'trayectoria',
      title: 'git log --career',
      commits: [
        { ...commitsBase[0], period: 'sep 2024 — hoy', msg: 'feat: arquitectura frontend para Chile y Perú, widgets en Modyo, Design System, herramientas con IA y servidores MCP' },
        { ...commitsBase[1], period: 'ene 2024 — sep 2024', msg: 'feat: microservicios y APIs REST en Node.js y Docker sobre GCP; analítica y mejoras UX/UI' },
        { ...commitsBase[2], period: 'ago 2022 — ene 2024', msg: 'feat: flujos comerciales de Entel en Vue.js; accesibilidad, componentes reutilizables y E2E' },
        { ...commitsBase[3], period: 'oct 2021 — ago 2022', msg: 'feat: plataforma retail de facturación con React y NestJS, PostgreSQL, Kafka y GCP; ~80% de cobertura' },
        { ...commitsBase[4], period: 'feb 2018 — oct 2021', msg: 'feat: sistemas internos con ASP.NET, JavaScript y SQL Server' },
        { ...commitsBase[5], period: 'jul 2016 — may 2017', msg: 'init: aplicaciones móviles publicadas con Scrum' },
      ],
      edu: ['ingeniero en informática — universidad rafael belloso chacín, 2016', 'full stack developer — 4geeks academy chile, 2021', 'español nativo · inglés profesional'],
    },
    contact: {
      eyebrow: 'contacto',
      title: 'Conectemos',
      sub: 'Disponible para roles de Frontend y Full Stack, en Chile o remoto. Respondo en menos de 24 horas.',
      copy: 'copiar',
      copied: 'copiado',
      available: 'disponible',
    },
    footer: { built: 'astro · autoalojado en vps', top: 'volver arriba' },
  },
  en: {
    meta: {
      title: 'Roberto Mendoza — Frontend & Full Stack Engineer',
      description:
        'Software engineer based in Santiago, Chile. 6 years building web platforms, design systems, APIs and applied-AI products.',
      ogAlt: 'Share card: Less friction. More product. Roberto Mendoza, Frontend & Full Stack Engineer, rm.byteforus.com',
    },
    nav: { work: 'work', stack: 'stack', log: 'career', contact: 'contact', label: 'Main navigation' },
    ui: { motion: 'motion', motionOn: 'on', motionOff: 'off' },
    hero: {
      eyebrow: 'software engineer • santiago, cl • frontend · full stack · cloud · ai',
      lines: ['Less friction.', 'More product.', ''],
      sub: 'I build fast, accessible frontends, and everything running behind them: APIs, microservices, cloud deployments and AI agents.',
      ctaWork: 'see work',
      ctaContact: 'contact',
      status: 'open to new challenges',
      torusCaption: 'fig.01 — ascii torus, rendered live',
    },
    terminal: [
      { cmd: 'whoami', out: ['roberto mendoza — frontend engineer @ entel'] },
      { cmd: 'cat profile.yml', out: ['experience: 6+ years', 'markets: [chile, peru]', 'focus: [frontend, full-stack, cloud, applied-ai]'] },
      { cmd: 'ls ~/projects', out: ['budget-for-both  what-i-have  family-health  dailyflow'] },
    ],
    metrics: [
      { k: 'uptime', v: '6+ years' },
      { k: 'team', v: 'Entel CL · PE' },
      { k: 'tests', v: '~80% coverage' },
      { k: 'deploy', v: 'gcp · docker · vps' },
    ],
    work: {
      eyebrow: 'work',
      title: 'Running processes',
      note: 'Own products, designed, built and deployed end to end on my own VPS.',
      status: 'online',
      projects: [
        {
          ...projectBase.budget,
          kind: 'finance · zero-knowledge',
          summary: 'Personal and couples finance. Data is encrypted on the client, so the server never sees your financial information.',
          log: ['client-side encryption and shared keys', 'expense ingestion from email', 'multi-currency and opentelemetry'],
        },
        {
          ...projectBase.wih,
          kind: 'inventory · applied ai',
          summary: 'Household inventory with an automatic shopping list that any MCP-capable AI agent can run for you.',
          log: ['custom mcp server', 'ci with e2e tests', 'non-root docker images'],
        },
        {
          ...projectBase.health,
          kind: 'health · family',
          summary: 'Family health tracking: OCR for lab results, trend charts and PDF reports.',
          log: ['lab-result ocr with tesseract.js', 'pdf reports', 'health checks and observability'],
        },
        {
          ...projectBase.flow,
          kind: 'automation · daily life',
          summary: 'Tracks public transport and books gym classes automatically.',
          log: ['playwright bots', 'bullmq and redis queues', 'pnpm monorepo'],
        },
      ],
    },
    stack: {
      eyebrow: 'stack',
      title: 'Dependency tree',
      groups: [
        { dir: 'frontend', items: ['react', 'vue.js', 'astro', 'typescript', 'web-components', 'liquid · modyo'] },
        { dir: 'backend', items: ['node.js · nestjs', 'express', 'rest apis', 'postgresql · sql-server', 'prisma · firebase', 'kafka'] },
        { dir: 'cloud', items: ['gcp: cloud run, functions, build', 'docker', 'ci/cd · github actions', 'linux · vps'] },
        { dir: 'quality', items: ['accessibility', 'design systems', 'technical seo', 'core web vitals', 'jest · e2e'] },
        { dir: 'ai', items: ['generative ai', 'ai agents', 'mcp servers', 'development harnesses'] },
      ],
    },
    log: {
      eyebrow: 'career',
      title: 'git log --career',
      commits: [
        { ...commitsBase[0], period: 'sep 2024 — now', msg: 'feat: frontend architecture for Chile and Peru, Modyo widgets, Design System, AI tooling and MCP servers' },
        { ...commitsBase[1], period: 'jan 2024 — sep 2024', msg: 'feat: Node.js and Docker microservices and REST APIs on GCP; analytics and UX/UI improvements' },
        { ...commitsBase[2], period: 'aug 2022 — jan 2024', msg: 'feat: Entel commercial flows in Vue.js; accessibility, reusable components and E2E' },
        { ...commitsBase[3], period: 'oct 2021 — aug 2022', msg: 'feat: retail invoicing platform with React and NestJS, PostgreSQL, Kafka and GCP; ~80% coverage' },
        { ...commitsBase[4], period: 'feb 2018 — oct 2021', msg: 'feat: internal systems with ASP.NET, JavaScript and SQL Server' },
        { ...commitsBase[5], period: 'jul 2016 — may 2017', msg: 'init: mobile apps shipped with Scrum' },
      ],
      edu: ['b.sc. computer engineering — universidad rafael belloso chacín, 2016', 'full stack developer — 4geeks academy chile, 2021', 'native spanish · professional english'],
    },
    contact: {
      eyebrow: 'contact',
      title: "Let's connect",
      sub: 'Open to Frontend and Full Stack roles, in Chile or remote. I reply within 24 hours.',
      copy: 'copy',
      copied: 'copied',
      available: 'available',
    },
    footer: { built: 'astro · self-hosted on vps', top: 'back to top' },
  },
};
