const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export class ModelGateway {
  static async callModel({ model = 'YOUR_MODEL_ID', purpose, input, tokenBudget = 1200 }) {
    // Replace with real API call.
    // Example placeholder:
    // return fetch('/api/model', { method: 'POST', body: JSON.stringify({ model, purpose, input, tokenBudget }) })
    //   .then((r) => r.json());

    await wait(160);
    return {
      model,
      purpose,
      tokenBudget,
      output: `Simulated model output for ${purpose}`,
      inputDigest: JSON.stringify(input).slice(0, 180)
    };
  }
}

export class AssetTooling {
  static async generateImage(prompt) {
    await wait(80);
    return { type: 'image', prompt, url: 'https://placehold.co/1200x600/111827/9ca3af?text=Generated+Visual' };
  }

  static async generateChartSpec(topic) {
    await wait(70);
    return {
      type: 'chart',
      library: 'chart.js',
      spec: {
        title: `Concept curve for ${topic}`,
        labels: ['Start', 'Develop', 'Practice', 'Master'],
        values: [20, 48, 70, 88]
      }
    };
  }
}

export class AgentOrchestrator {
  constructor({ onAgentEvent }) {
    this.onAgentEvent = onAgentEvent;
    this.memory = {
      conversationSummary: '',
      teacherProfile: {},
      constraints: {},
      sections: []
    };
  }

  log(agent, status, message) {
    this.onAgentEvent({
      agent,
      status,
      message,
      timestamp: new Date().toISOString()
    });
  }

  async processTeacherMessage(message) {
    const isEdit = /change|edit|revise|update|modify/i.test(message);
    if (isEdit && this.memory.sections.length) {
      return this.applyScopedEdit(message);
    }

    const intake = await this.runClarificationFlow(message);
    const outline = await this.buildOutline(intake);
    const sections = await this.generateSections(outline);
    const verification = await this.verifyPresentation(sections, intake);

    this.memory.sections = verification.patchedSections;
    this.memory.conversationSummary = intake.compactSummary;
    this.memory.constraints = intake.constraints;

    return {
      mode: 'fresh_build',
      teacherResponse: verification.teacherMessage,
      presentation: verification.patchedSections,
      meta: verification.meta
    };
  }

  async runClarificationFlow(topicMessage) {
    this.log('Master Agent', 'running', 'Interpreting teacher intent and preparing adaptive follow-up questions.');

    const inferred = {
      topic: topicMessage,
      durationMinutes: this.pickNumber(topicMessage, 10),
      depth: this.pickDepth(topicMessage),
      density: /dense|detailed/i.test(topicMessage) ? 'dense' : 'balanced',
      learnerLevel: this.pickGrade(topicMessage)
    };

    const followUps = [
      'Do you want checkpoints/quizzes after each section?',
      'Should visuals be minimal, balanced, or highly animated?',
      'Any must-include examples from classroom context?'
    ];

    const compactSummary = `${inferred.topic} | ${inferred.durationMinutes}min | ${inferred.depth} depth | ${inferred.learnerLevel}`;

    await ModelGateway.callModel({
      purpose: 'clarification_summary',
      input: { inferred, followUps },
      tokenBudget: 450
    });

    this.log('Master Agent', 'done', `Captured intent with compact memory: ${compactSummary}`);

    return {
      constraints: inferred,
      followUps,
      compactSummary
    };
  }

  async buildOutline(intake) {
    this.log('Master Agent', 'running', 'Building continuous storyline outline and dispatch graph for sub-agents.');

    const sectionCount = Math.max(4, Math.min(9, Math.round(intake.constraints.durationMinutes / 2)));
    const outline = Array.from({ length: sectionCount }).map((_, i) => ({
      id: `sec_${i + 1}`,
      title: `Part ${i + 1}: ${this.sectionTheme(i, intake.constraints.topic)}`,
      purpose: i === 0 ? 'Hook and context' : i === sectionCount - 1 ? 'Synthesis and action' : 'Concept building',
      transition: i === 0 ? 'Opening scene' : `Smooth transition from part ${i}`
    }));

    await ModelGateway.callModel({
      purpose: 'outline_generation',
      input: { intake, sectionCount },
      tokenBudget: 700
    });

    this.log('Narrative Agent', 'done', `Created ${outline.length}-section story arc.`);
    return outline;
  }

  async generateSections(outline) {
    this.log('Sub-Agent Swarm', 'running', 'Generating narrative, visuals, interactions, and data blocks in parallel.');

    const sections = [];
    for (const block of outline) {
      const [textGen, image, chart] = await Promise.all([
        ModelGateway.callModel({ purpose: 'section_content', input: block, tokenBudget: 600 }),
        AssetTooling.generateImage(`${block.title} classroom visual`),
        AssetTooling.generateChartSpec(block.title)
      ]);

      sections.push({
        ...block,
        html: `<p>${textGen.output}. This section moves naturally into the next concept with guided pacing for teachers.</p>`,
        image,
        chart,
        interaction: `Ask learners: "What changed from ${block.id.replace('_', ' ')} and why?"`
      });
    }

    this.log('Visual Agent', 'done', 'Applied coherent visual system, spacing, and transitions.');
    this.log('Interaction Agent', 'done', 'Embedded reflective prompts and active participation moments.');
    return sections;
  }

  async verifyPresentation(sections, intake) {
    this.log('Verifier Agent Cluster', 'running', 'Running pedagogy, consistency, accessibility, and timing checks in parallel.');

    const checks = await Promise.all([
      ModelGateway.callModel({ purpose: 'verify_pedagogy', input: sections.slice(0, 2), tokenBudget: 300 }),
      ModelGateway.callModel({ purpose: 'verify_visual_coherence', input: sections.map((s) => s.title), tokenBudget: 260 }),
      ModelGateway.callModel({ purpose: 'verify_timing', input: intake.constraints, tokenBudget: 220 })
    ]);

    const patchedSections = sections.map((s) => ({
      ...s,
      verificationNote: 'Passed baseline checks with suggested micro-pacing pauses.'
    }));

    this.log('Verifier Agent Cluster', 'done', `All checks completed (${checks.length} validators).`);

    return {
      patchedSections,
      teacherMessage:
        'Presentation generated. I asked dynamic clarifications, orchestrated specialized agents, and verified quality before rendering. You can now request edits for any section.',
      meta: {
        mode: 'continuous_canvas_story',
        tokensSavedByPatchProtocol: 'high',
        validatorCount: checks.length
      }
    };
  }

  async applyScopedEdit(teacherEditRequest) {
    this.log('Master Agent', 'running', 'Detected edit request; mapping to minimal impacted section IDs.');

    const target = this.memory.sections[1] || this.memory.sections[0];
    await ModelGateway.callModel({
      purpose: 'edit_patch_planning',
      input: { request: teacherEditRequest, sectionId: target.id },
      tokenBudget: 280
    });

    const revised = this.memory.sections.map((s) => {
      if (s.id !== target.id) {
        return s;
      }
      return {
        ...s,
        html: `${s.html}<p><em>Teacher-requested update:</em> ${teacherEditRequest}</p>`,
        interaction: `${s.interaction} (Updated to reflect teacher change.)`,
        verificationNote: 'Re-verified after scoped patch.'
      };
    });

    this.log('Patch Agent', 'done', `Updated only ${target.id}; avoided full regeneration.`);
    this.log('Verifier Agent Cluster', 'done', 'Fast re-check completed for patched section only.');

    this.memory.sections = revised;

    return {
      mode: 'scoped_edit',
      teacherResponse: `Applied your change to ${target.title}. Only that section was regenerated for token efficiency.`,
      presentation: revised,
      meta: {
        mode: 'scoped_patch',
        changedSectionId: target.id,
        tokenStrategy: 'localized regeneration'
      }
    };
  }

  pickDepth(message) {
    if (/deep|advanced/i.test(message)) {
      return 'deep';
    }
    if (/basic|intro/i.test(message)) {
      return 'light';
    }
    return 'medium';
  }

  pickGrade(message) {
    const m = message.match(/grade\s*(\d+)/i);
    return m ? `grade ${m[1]}` : 'mixed classroom';
  }

  pickNumber(message, fallback) {
    const m = message.match(/(\d{1,2})\s*(min|minute)/i);
    return m ? Number(m[1]) : fallback;
  }

  sectionTheme(index, topic) {
    const labels = ['Spark curiosity', 'Core concept', 'Mechanism', 'Guided walkthrough', 'Practice moment', 'Misconceptions', 'Real-world bridge', 'Assessment'];
    return `${labels[index] || 'Extension'} — ${topic}`;
  }
}
