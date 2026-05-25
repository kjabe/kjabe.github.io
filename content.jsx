// Shared content for all directions. Single source of truth pulled from
// the website-koji files. Anything inferred (one-liner, short bio, location,
// extra projects/roles) is marked with isPlaceholder:true so each direction
// can render it with a clear "draft — please review" affordance.

const Ph = ({ children, style }) => (
  <span className="ph" style={style} title="Placeholder — please review">
    {children}
  </span>
);

// One-liner — drafted from the long bio.
const ONE_LINER = {
  text: "Research data scientist building reliable ML workflows for biomedical research.",
  isPlaceholder: true,
};

// Short bio — drafted from the long bio (~50 words).
const SHORT_BIO = {
  text: "I work on the Marlowe research-computing team at Stanford, helping researchers run GPU/HPC workflows well. Before that I built multi-omics biomarker pipelines for Stanford Medicine's Human Immune Monitoring Center. I care about reproducibility, interpretability, and making the boring parts of science less boring.",
  isPlaceholder: true,
};

const LONG_BIO_PARAGRAPHS = [
  "Research data scientist and computational biologist building reliable, reproducible machine-learning workflows for biomedical research.",
  "Previously at Stanford Medicine's Human Immune Monitoring Center: multi-omics biomarker pipelines on Marlowe HPC, and enablement tools (immunoassay QC, reporting in R Shiny) that standardize analyses for collaborators.",
  "Koji is currently a Research Data Scientist on the Marlowe research-computing enablement team, supporting researchers with GPU/HPC workflows, performance debugging, and reproducible best practices.",
  "Earlier, wet-lab rapid diagnostics in industry — including a COVID-19 rapid antigen test program that contributed to FDA Emergency Use Authorization.",
  "He holds a PhD in Bioengineering from the University of Washington.",
];

const NOW = {
  text: "Supporting researchers on Stanford's Marlowe GPU/HPC cluster — workflow review, performance debugging, and writing the kinds of small tools that turn ad-hoc one-offs into something a lab can actually rely on.",
  isPlaceholder: true,
};

const LOCATION = { text: "Stanford, California", isPlaceholder: false };

const PROJECTS = [
  {
    title: "Marlowe",
    slug: "marlowe",
    year: 2026,
    role: "Research data scientist — enablement team",
    status: "active",
    featured: true,
    tags: ["python", "etl", "research-computing", "slurm", "reporting"],
    summary:
      "Usage ETL and reporting for Stanford's Marlowe GPU/HPC cluster. Ingests Slurm sacct records and award/project metadata, processes them with Python, and publishes static markdown reports and visualizations to GitHub Pages — clear views of cluster usage, project allocations, and award utilization for PIs, researchers, and admins.",
    mark: "./project-marks/marlowe-gpu.svg",
    isPlaceholder: false,
  },
  {
    title: "Immunoassay QC Shiny",
    slug: "immunoassay-qc",
    year: 2025,
    role: "Lead developer",
    status: "shipped",
    featured: false,
    tags: ["r", "shiny", "qc", "reporting"],
    summary:
      "R Shiny application for immunoassay QC and reporting at Stanford Medicine's Human Immune Monitoring Center. Standardized core QC steps across collaborators and cut the ad-hoc reporting burden on the analytical team.",
    mark: "./project-marks/immunoassay-qc-dashboard.svg",
    isPlaceholder: true,
  },
  {
    title: "Biomarker modeling pipeline",
    slug: "biomarker-modeling",
    year: 2024,
    role: "ML engineer / computational biologist",
    status: "shipped",
    featured: false,
    tags: ["python", "ml", "multi-omics", "interpretability"],
    summary:
      "Multi-omics biomarker modeling pipeline with built-in generalization testing and interpretability. Designed to be reproducible end-to-end and scalable on Stanford's Marlowe cluster.",
    mark: "./project-marks/biomarker-modeling-dag.svg",
    isPlaceholder: true,
  },
  {
    title: "COVID-19 rapid antigen test",
    slug: "covid-rapid-antigen",
    year: 2021,
    role: "Diagnostic development",
    status: "shipped",
    featured: false,
    tags: ["diagnostics", "assay-development", "regulatory"],
    summary:
      "Rapid diagnostic development in industry — contributed to a COVID-19 rapid antigen test program that received EUA approval.",
    mark: "./project-marks/covid-rapid-antigen-cassette.svg",
    isPlaceholder: true,
  },
  {
    title: "Disposable autonomous device for swab-to-result influenza diagnosis",
    slug: "influenza-swab-device",
    year: 2017,
    role: "Co-author · PhD bioengineering",
    status: "shipped",
    featured: false,
    tags: ["point-of-care", "diagnostics", "influenza", "paper-microfluidics"],
    summary:
      "Co-developed (2nd author) a self-contained disposable device that runs a sandwich immunoassay for influenza A/B from a nasal swab — no instrumentation, ~35-min total time. Clinically evaluated at Seattle Children's Hospital. Anal. Chem. 2017, 89, 5776–5783.",
    paperUrl: "https://pubs.acs.org/doi/abs/10.1021/acs.analchem.6b04801",
    mark: "./project-marks/influenza-swab-device-cassette.svg",
    isPlaceholder: false,
  },
  {
    title: "Inkjet-printed microfluidic multianalyte chemical sensing paper",
    slug: "inkjet-microfluidic-paper",
    year: 2008,
    role: "First author · Keio B.Eng. research",
    status: "shipped",
    featured: false,
    tags: ["paper-microfluidics", "inkjet", "colorimetric-sensing", "analytical-chemistry"],
    summary:
      "First-author paper introducing inkjet printing as a single-apparatus method for fabricating paper-based microfluidic devices — patterning 550 μm hydrophilic channels by inkjet-etching a poly(styrene) layer, then printing colorimetric sensing chemistry into wells. Anal. Chem. 2008, 80, 6928–6934. Part of the >1,300-citation pair (top ~1% most-cited in Chemistry in its published year).",
    paperUrl: "https://pubs.acs.org/doi/10.1021/ac800604v",
    mark: "./project-marks/inkjet-microfluidic-paper-chip.svg",
    isPlaceholder: false,
  },
];

const EXPERIENCE = [
  {
    role: "Research Data Scientist",
    org: "Stanford Marlowe — research computing enablement",
    start: "2025",
    end: "Present",
    location: "Stanford, CA",
    notes: [
      "Support researchers on GPU/HPC workflows, performance debugging, reproducibility.",
      "Built the Marlowe usage ETL + reporting pipeline (Slurm sacct → static reports on GitHub Pages).",
    ],
    isPlaceholder: false,
  },
  {
    role: "Computational Biologist",
    org: "Stanford Medicine — Human Immune Monitoring Center",
    start: "2022",
    end: "2025",
    location: "Stanford, CA",
    notes: [
      "Multi-omics biomarker modeling pipelines with generalization testing and interpretability.",
      "R Shiny enablement tools to standardize immunoassay QC and reporting across collaborators.",
    ],
    isPlaceholder: true,
  },
  {
    role: "Diagnostic Development",
    org: "Industry — rapid diagnostics",
    start: "2020",
    end: "2022",
    location: "—",
    notes: [
      "Led and supported development of rapid diagnostic assays.",
      "Contributed to a COVID-19 rapid antigen test program that received EUA approval.",
    ],
    isPlaceholder: true,
  },
];

const EDUCATION = [
  {
    degree: "PhD, Bioengineering",
    school: "University of Washington",
    year: "—",
    isPlaceholder: false,
  },
];

const LINKS = {
  // Primary email — matches /content/links.md.
  email: "kojiabe@stanford.edu",
  github: { url: "https://github.com/", label: "GitHub", isPlaceholder: true },
  linkedin: { url: "https://www.linkedin.com/in/koji-abe-uw-bioe", label: "LinkedIn", isPlaceholder: false },
  scholar: { url: "https://scholar.google.com/citations?user=PoAu5rcAAAAJ&hl=en", label: "Google Scholar", isPlaceholder: false },
};

const WRITING = {
  empty: "Notes are forthcoming. In the meantime, find Koji on LinkedIn for the occasional research-computing thread.",
  isPlaceholder: true,
};

// -----------------------------------------------------------------------------
// Career timeline — derived from EXPERIENCE + EDUCATION above, with a couple
// of inferred "milestone" markers. Shared by all timeline-style directions.
// Ordered most-recent first.
// -----------------------------------------------------------------------------
const CAREER_TIMELINE = [
  {
    id: "marlowe",
    start: "2026",
    end: "Now",
    period: "2026 — Now",
    role: "Research Data Scientist",
    org: "Marlowe Team, Stanford HAI",
    orgLong: "Stanford HAI · Marlowe Team",
    location: "Stanford, CA",
    kind: "work",
    blurb:
      "Supporting researchers on Stanford's Marlowe GPU/HPC cluster — workflow review, performance debugging, and the small tools that turn ad-hoc one-offs into something a lab can rely on.",
    highlights: ["Slurm sacct ETL", "Static usage reports", "HPC enablement"],
    metric: { value: "GPU/HPC", label: "enablement" },
    lab: "dry",
    isPlaceholder: false,
  },
  {
    id: "himc",
    start: "2023",
    end: "2026",
    period: "2023 — 2026",
    role: "Computational Biologist",
    org: "HIMC, Stanford Medicine",
    orgLong: "Stanford Medicine · Human Immune Monitoring Center",
    location: "Stanford, CA",
    kind: "work",
    blurb:
      "Built multi-omics biomarker modeling pipelines with generalization testing and interpretability. Shipped an R Shiny QC/reporting tool that standardized analyses across collaborators.",
    highlights: ["Multi-omics ML", "Shiny QC tool", "Interpretability"],
    metric: { value: "multi-omics", label: "pipelines" },
    lab: "dry",
    isPlaceholder: true,
  },
  {
    id: "diagnostics",
    start: "2018",
    end: "2022",
    period: "2018 — 2022",
    role: "Diagnostic Development",
    org: "Industry",
    orgLong: "Rapid diagnostics — industry",
    location: "—",
    kind: "work",
    blurb:
      "Led development of an Anthrax rapid test that received FDA marketing rights through the De Novo classification process. Contributed to a COVID-19 rapid antigen test program that received EUA approval at the height of the pandemic.",
    highlights: ["Anthrax De Novo", "COVID-19 EUA", "Assay development"],
    metric: { value: "De Novo + EUA", label: "regulatory wins" },
    lab: "wet",
    isPlaceholder: true,
  },
  {
    id: "phd",
    start: "2012",
    end: "2018",
    period: "2012 — 2018",
    role: "PhD, Bioengineering",
    org: "University of Washington",
    orgLong: "University of Washington · Bioengineering",
    location: "Seattle, WA",
    kind: "edu",
    blurb:
      "Doctoral training in bioengineering, focused on improving the sensitivity of lateral-flow immunoassays — work that culminated in the swab-to-result influenza device co-author paper at the end of the program.",
    highlights: ["Lateral-flow assays", "Sensitivity engineering", "Influenza device paper"],
    metric: { value: "PhD", label: "bioengineering" },
    lab: "wet",
    isPlaceholder: true,
  },
  {
    id: "terumo",
    start: "2010",
    end: "2012",
    period: "2010 — 2012",
    role: "Catheter Development",
    org: "Terumo Corporation",
    orgLong: "Terumo Corporation",
    location: "Shizuoka, Japan",
    kind: "work",
    blurb:
      "Supported balloon catheter design modifications for the US market launch — design iteration, verification-focused testing support, and cross-functional coordination.",
    highlights: ["Balloon catheter design", "US market launch", "Verification support"],
    metric: { value: "US launch", label: "support" },
    lab: "wet",
    isPlaceholder: false,
  },
  {
    id: "keio",
    start: "2007",
    end: "2010",
    // Period shows the lab-research years (per the user). Full attendance was
    // April 2004 – March 2010 (B.Eng + M.Eng); active lab work was 2007–2010.
    period: "2007 — 2010",
    role: "Analytical Chemistry Research",
    org: "Keio University",
    orgLong: "Keio University · Department of Applied Chemistry",
    location: "Yokohama, Japan",
    kind: "edu",
    blurb:
      "Lab research with the Citterio / Suzuki group on inkjet-printed paper microfluidic devices for chemical sensing — first-author work using a single printer to pattern hydrophilic channels (by inkjet-etching a hydrophobic layer) and dispense colorimetric sensing chemistry into the patterned wells.",
    highlights: ["Paper microfluidics", "Inkjet patterning", "Colorimetric sensing"],
    metric: { value: "inkjet", label: "paper microfluidics" },
    lab: "wet",
    isPlaceholder: false,
  },
];

// -----------------------------------------------------------------------------
// useInView — IntersectionObserver hook. Returns [ref, inView] where inView
// stays true once an element first enters view (so re-scrolling up doesn't
// reset the animation). Used by every timeline direction's scroll-reveal.
// -----------------------------------------------------------------------------
function useInView({ threshold = 0.18, rootMargin = "0px 0px -8% 0px", once = true, rootRef = null } = {}) {
  const ref = React.useRef(null);
  const [inView, setInView] = React.useState(false);
  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const root = rootRef && rootRef.current ? rootRef.current : null;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { threshold, rootMargin, root }
    );
    obs.observe(node);
    // Safety net: if IO never fires (e.g. iframe quirks), reveal after a
    // delay so the page is never permanently blank.
    const fallback = setTimeout(() => setInView(true), 2200);
    return () => { obs.disconnect(); clearTimeout(fallback); };
  }, [threshold, rootMargin, once, rootRef]);
  return [ref, inView];
}

Object.assign(window, {
  Ph,
  useInView,
  CONTENT: {
    careerTimeline: CAREER_TIMELINE,
    name: "Koji Abe",
    oneLiner: ONE_LINER,
    shortBio: SHORT_BIO,
    longBioParagraphs: LONG_BIO_PARAGRAPHS,
    now: NOW,
    location: LOCATION,
    projects: PROJECTS,
    experience: EXPERIENCE,
    education: EDUCATION,
    links: LINKS,
    writing: WRITING,
  },
});
