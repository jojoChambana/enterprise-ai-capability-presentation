/**
 * Generates Presentation_Script.docx
 * Run: npm install docx && node docs/build-presentation-script.cjs
 * Then commit the generated .docx to the repo.
 */
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, AlignmentType,
  BorderStyle, PageBreak
} = require("docx");

const NAVY = "1B3A5C";
const DARK_GRAY = "333333";
const MED_GRAY = "666666";
const ACCENT = "2E75B6";

function p(text, opts = {}) {
  const runs = [];
  if (typeof text === "string") {
    runs.push(new TextRun({
      text, font: "Georgia", size: opts.size || 24,
      color: opts.color || DARK_GRAY, bold: opts.bold || false, italics: opts.italics || false,
    }));
  } else {
    text.forEach(r => {
      runs.push(new TextRun({
        font: "Georgia", size: r.size || opts.size || 24,
        color: r.color || opts.color || DARK_GRAY,
        bold: r.bold || opts.bold || false, italics: r.italics || opts.italics || false, ...r,
      }));
    });
  }
  return new Paragraph({
    children: runs,
    spacing: { after: opts.after || 200, before: opts.before || 0, line: opts.line || 320 },
    alignment: opts.align || AlignmentType.LEFT,
    ...(opts.border ? { border: opts.border } : {}),
  });
}

function heading(text, level) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: level === 1 ? 36 : 28, bold: true, color: NAVY })],
    spacing: { before: level === 1 ? 480 : 360, after: 200 },
    alignment: AlignmentType.LEFT,
    ...(level === 1 ? { border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 8 } } } : {}),
  });
}

function spacer(size = 120) {
  return new Paragraph({ children: [], spacing: { after: size } });
}

function stage(text) {
  return p(text, { italics: true, color: MED_GRAY, size: 22, after: 160 });
}

const children = [];

// ── Title Page ──
children.push(spacer(1200));
children.push(new Paragraph({
  children: [new TextRun({ text: "Presentation Script", font: "Arial", size: 52, bold: true, color: NAVY })],
  alignment: AlignmentType.CENTER, spacing: { after: 120 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Internal AI Engineering Capability Proposal", font: "Arial", size: 32, color: ACCENT })],
  alignment: AlignmentType.CENTER, spacing: { after: 400 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Speaker Notes & Delivery Guide", font: "Georgia", size: 24, italics: true, color: MED_GRAY })],
  alignment: AlignmentType.CENTER, spacing: { after: 200 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Confidential \u2014 For Presenter Use Only", font: "Arial", size: 20, color: MED_GRAY })],
  alignment: AlignmentType.CENTER, spacing: { after: 600 },
}));

children.push(new Paragraph({
  children: [new TextRun({ text: "How to Use This Script", font: "Arial", size: 26, bold: true, color: NAVY })],
  alignment: AlignmentType.CENTER, spacing: { after: 200 },
}));
children.push(p("This script is designed to accompany your slide deck, not replace it. It gives you the words, the pacing cues, and the emotional beats for each section of the presentation. Read through it a few times before presenting. Adapt the language to sound like you. The goal is to walk into the room feeling prepared and grounded\u2014not rehearsed.", { size: 22, color: MED_GRAY, after: 100, line: 300 }));
children.push(p([
  { text: "Stage directions ", italics: true, color: MED_GRAY, size: 22 },
  { text: "appear in gray italics and indicate pauses, slide transitions, or tone shifts.", color: MED_GRAY, size: 22 },
], { after: 300 }));
children.push(new Paragraph({ children: [new PageBreak()] }));

// ── Opening ──
children.push(heading("Opening", 1));
children.push(stage("Pause. Look around the room. Make eye contact before you begin."));
children.push(p("Thank you all for making time for this. I know your calendars are full, so I want to be respectful of your time while also being thorough\u2014because what we\u2019re going to talk about today matters."));
children.push(p("I\u2019m here to share a proposal for building an internal AI engineering capability. And I want to be upfront about something: this is not a pitch for the latest shiny technology. This is a conversation about how we can solve real problems that our teams deal with every day\u2014problems that are costing us time, quality, and institutional knowledge."));
children.push(p("Before I get into any specifics, I want to set the tone. Everything I\u2019m going to present has been designed with our governance requirements in mind. Nothing here bypasses security. Nothing here replaces people. And nothing moves forward without your approval."));
children.push(stage("Brief pause. Let that land."));
children.push(p("So let\u2019s start with the problem."));

// ── The Problem ──
children.push(heading("The Problem We\u2019re Solving", 1));
children.push(stage("Shift to a conversational, relatable tone here."));
children.push(p("I think most of us in this room have felt this: we have talented engineers spending significant chunks of their week on work that doesn\u2019t require their full expertise. Documentation that falls behind. Onboarding materials that are always out of date. Repetitive code analysis tasks. Configuration reviews."));
children.push(p("None of these are trivial\u2014they all matter. But they consume time that our people could spend on higher-value work. And when our experienced staff move on or retire, the knowledge they carry often walks out the door with them."));
children.push(p("At the same time, we\u2019re seeing external AI costs grow. Every time we send data to a cloud API, we\u2019re paying per token, and in some cases, we\u2019re limited in what we can send because of data sensitivity. That creates a ceiling on what we can actually accomplish with AI tools."));
children.push(stage("Pause briefly. Then transition with purpose."));
children.push(p("So the question becomes: is there a way to get meaningful AI assistance internally, under our control, within our security boundaries, and at a lower cost over time? I believe there is."));

// ── The Proposed Capability ──
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading("The Proposed Capability", 1));
children.push(stage("This is the core of the presentation. Slow down. Be clear and precise."));
children.push(p("What I\u2019m proposing is a hybrid AI platform. And I want to explain what that means in plain terms."));
children.push(p("We would use a cloud AI service\u2014Claude, from Anthropic\u2014for the things it does best: strategic reasoning, planning, and validation. Think of it as the advisor. It helps us think through problems, review approaches, and catch things we might miss."));
children.push(p("Then, for the actual execution work\u2014processing our repositories, generating documentation, running analysis against our codebase\u2014we would use local AI models running inside our own environment. On our hardware. Behind our firewall. Under our control."));
children.push(stage("If presenting to security-focused audience, emphasize the next point."));
children.push(p("Here\u2019s the key: our sensitive data stays local. Claude receives summaries, diffs, and metrics\u2014not full datasets, not source code, not personally identifiable information. The local agents do the heavy lifting with our data, and Claude provides the strategic intelligence layer on top."));
children.push(p("This isn\u2019t about building autonomous AI. This is about building a structured, governed capability where AI assists our staff under human oversight at every step."));

// ── Why This Approach ──
children.push(heading("Why This Approach", 1));
children.push(stage("Anticipate the question: why not just buy a SaaS product?"));
children.push(p("You might be wondering: why not just use a fully cloud-based AI service? It\u2019s a fair question."));
children.push(p("The short answer is control and cost. A SaaS-only approach means all of our data goes to someone else\u2019s infrastructure. It means per-token pricing that scales with usage. And it means we\u2019re dependent on a vendor\u2019s roadmap and pricing decisions."));
children.push(p("With a hybrid approach, we keep sensitive processing internal. We reduce our ongoing cloud costs because the local models handle the bulk of the work. And we build internal expertise\u2014our team learns how to operate and maintain AI tooling, which becomes an organizational asset."));
children.push(p("That said, I want to be honest: this approach does require some upfront investment in infrastructure and staff time. But it\u2019s designed to be incremental. We don\u2019t have to build everything at once. We start small, prove value, and expand from there."));

// ── Governance and Security ──
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading("Governance and Security", 1));
children.push(stage("If the IT Director or security stakeholders are in the room, speak directly to them here."));
children.push(p("I know governance is not negotiable for us, and it shouldn\u2019t be. So let me walk through how this capability is designed to work within our existing frameworks."));
children.push(p("First, data privacy. All institutional data processing happens locally. Nothing sensitive leaves our network. The cloud AI layer only receives curated summaries that have been filtered through our own systems."));
children.push(p("Second, auditability. Every action the AI takes is logged. Every recommendation it makes is reviewed by a human before it\u2019s implemented. We build approval gates into the workflow\u2014this isn\u2019t a system that acts on its own."));
children.push(p("Third, access control. The system operates on least-privilege principles. It only accesses the repositories and resources it\u2019s been explicitly authorized to touch. And that authorization goes through our standard change management process."));
children.push(p("Fourth\u2014and this is important\u2014we can stop at any time. The system is designed with clear off-switches. If something isn\u2019t working, if a security concern arises, if leadership decides to pause, we can do that cleanly and safely."));

// ── AI Learning ──
children.push(heading("A Note on AI \u201CLearning\u201D", 1));
children.push(stage("This section addresses a common concern. Be direct and reassuring."));
children.push(p("I want to address something that often comes up when people hear about AI in an enterprise setting: the idea of AI \u201Clearning.\u201D"));
children.push(p("In our system, learning does not mean the AI is training itself or evolving without oversight. What it means is structured knowledge retrieval. We index our institutional knowledge\u2014documentation, runbooks, architectural decisions\u2014and the AI uses that index to give better answers. It\u2019s more like a very smart search engine than a self-improving system."));
children.push(p("We use techniques like retrieval-augmented generation, which means the AI pulls from our curated knowledge base rather than making things up. We use human-curated playbooks that define how the AI should approach specific tasks. And we use evaluation feedback loops where our engineers review AI outputs and flag what needs improvement."));
children.push(p("We are not training new models. We are not creating competitive AI systems. We are making our existing tools smarter by giving them access to our own institutional knowledge, in a controlled way."));

// ── Implementation ──
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading("How We Get There", 1));
children.push(stage("Shift to a pragmatic, step-by-step tone."));
children.push(p("I\u2019m recommending a phased approach. No big bang. No massive upfront commitment."));
children.push(p([
  { text: "Phase One ", bold: true },
  { text: "is a controlled pilot. We pick one team, one use case\u2014something like automated documentation generation for a specific repository. We set it up, run it for sixty to ninety days, measure the results, and report back to this group." },
]));
children.push(p([
  { text: "Phase Two ", bold: true },
  { text: "expands based on what we learn. If the pilot shows value, we add more use cases and more teams. We refine the governance processes based on real-world experience." },
]));
children.push(p([
  { text: "Phase Three ", bold: true },
  { text: "is the longer-term vision: a mature internal platform that multiple teams across the organization can use for a variety of engineering and analysis tasks. But we only get there by earning trust at each stage." },
]));
children.push(p("The infrastructure requirements are modest for the pilot. We\u2019re talking about a dedicated server with a capable GPU, standard storage, and network isolation. The cost estimate for Phase One is included in the written proposal, and I\u2019m happy to walk through those numbers in detail."));

// ── Risks ──
children.push(heading("Risks and Honesty", 1));
children.push(stage("This is where you build credibility. Don\u2019t shy away from the challenges."));
children.push(p("I don\u2019t want to stand here and tell you this is risk-free, because it\u2019s not. Let me be straightforward about the challenges."));
children.push(p("There\u2019s a maintenance burden. Running local AI infrastructure means someone has to keep it running. Models need updates. Systems need monitoring. We need to account for that in our staffing."));
children.push(p("There\u2019s a learning curve. Our teams will need time to understand how to work with these tools effectively. Not everyone will be comfortable with it right away, and that\u2019s okay."));
children.push(p("There\u2019s vendor dependency on the cloud AI side. If Anthropic changes their pricing or their API, we need a plan. The hybrid model helps here because our local capability gives us a fallback, but it\u2019s still a factor."));
children.push(p("And there\u2019s organizational readiness. Adopting AI-assisted engineering is a cultural shift as much as a technical one. We need buy-in not just from leadership, but from the engineers who will actually use it day to day."));
children.push(p("For each of these risks, we have mitigation strategies outlined in the written proposal. But I wanted to name them openly because I think transparency is how we build trust in this process."));

// ── Closing ──
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading("Closing", 1));
children.push(stage("Slow down. Speak from conviction, not from slides."));
children.push(p("Let me bring this back to what matters."));
children.push(p("We have good people doing important work. And right now, a meaningful portion of their time is spent on tasks that AI can help with\u2014not replace, but help with. Documentation. Analysis. Knowledge management. Repetitive review cycles."));
children.push(p("What I\u2019m asking for today is not a blank check. I\u2019m asking for approval to run a controlled pilot. Sixty to ninety days. One team. One use case. Clear success criteria. Full reporting back to this group."));
children.push(p("If it works, we\u2019ll have data to support expanding. If it doesn\u2019t, we\u2019ll have learned something valuable at a modest cost. Either way, we\u2019ll have made a deliberate, informed decision rather than waiting while the rest of our industry moves forward."));
children.push(stage("Pause. Make eye contact."));
children.push(p("I believe this is the right approach for our organization, at the right time, done the right way. And I\u2019m grateful for the opportunity to make the case."));
children.push(p("I\u2019d love to open it up for questions."));
children.push(stage("Stay standing. Stay calm. Let the silence work for you if there\u2019s a pause before questions begin."));

// ── Q&A Prep ──
children.push(new Paragraph({ children: [new PageBreak()] }));
children.push(heading("Anticipated Questions & Suggested Responses", 1));
children.push(p("The following are questions you may receive and suggested ways to address them. Adapt these to your own voice.", { italics: true, color: MED_GRAY, size: 22, after: 300 }));

const qas = [
  { q: "What happens if the AI makes a mistake?", a: "Every AI output goes through human review before anything is implemented. The system recommends; our people decide. If something looks wrong, it gets flagged and corrected. That\u2019s by design, not by accident." },
  { q: "Is this going to replace jobs?", a: "No. This is designed to augment our staff, not replace them. The goal is to free up our engineers from repetitive tasks so they can focus on higher-value work. We still need their expertise\u2014the AI just helps them be more efficient." },
  { q: "How much is this going to cost?", a: "The Phase One pilot is a modest investment\u2014primarily a dedicated server with GPU capability and staff time for setup and oversight. The detailed cost breakdown is in the written proposal. Compared to our current external API spend, the local processing model should reduce ongoing costs significantly over time." },
  { q: "What if Anthropic raises their prices or changes their terms?", a: "That\u2019s exactly why we\u2019re proposing a hybrid model rather than going all-in on cloud AI. Our local capability gives us a foundation that doesn\u2019t depend on any single vendor. If we need to adjust the cloud component, we can do that without losing the core platform." },
  { q: "How do we know our data is safe?", a: "Sensitive data processing happens entirely on our local infrastructure, behind our firewall. The cloud AI layer only receives curated summaries\u2014no source code, no PII, no raw datasets. And the entire system operates under our existing access control and change management policies." },
  { q: "Why can\u2019t we just use ChatGPT or Copilot?", a: "Those are valuable tools for individual productivity, but they don\u2019t give us institutional control. They process data on external servers, they don\u2019t integrate with our governance frameworks, and they don\u2019t allow us to build institutional knowledge retrieval. This proposal is about creating an organizational capability, not just giving individuals a chatbot." },
  { q: "What does success look like?", a: "For the pilot, success means measurable improvement in the specific use case we choose\u2014whether that\u2019s documentation turnaround time, onboarding speed, or analysis throughput. We\u2019ll define specific metrics before we start and report on them transparently." },
];

qas.forEach(({ q, a }) => {
  children.push(p(q, { bold: true, color: NAVY, before: 240, after: 80 }));
  children.push(p(a, { size: 23, after: 200, line: 300 }));
});

// ── Build Document ──
const doc = new Document({
  styles: { default: { document: { run: { font: "Georgia", size: 24 } } } },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      },
    },
    children,
  }],
});

const outPath = path.join(__dirname, "Presentation_Script.docx");
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(outPath, buffer);
  console.log(`Generated: ${outPath}`);
});
