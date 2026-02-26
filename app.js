import { AgentOrchestrator } from './agents.js';

const chatLog = document.getElementById('chatLog');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const stage = document.getElementById('presentationStage');
const stageMeta = document.getElementById('stageMeta');
const agentTimeline = document.getElementById('agentTimeline');
const resetBtn = document.getElementById('resetBtn');

const chatTemplate = document.getElementById('chatItemTemplate');
const agentTemplate = document.getElementById('agentItemTemplate');

const orchestrator = new AgentOrchestrator({
  onAgentEvent: appendAgentEvent
});

appendChat('system', 'Welcome! Share your teaching topic and goals. I will coordinate agents to create an immersive continuous presentation.');

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = chatInput.value.trim();
  if (!message) {
    return;
  }

  appendChat('teacher', message);
  chatInput.value = '';

  stageMeta.textContent = 'Agents are working...';

  const result = await orchestrator.processTeacherMessage(message);
  appendChat('assistant', result.teacherResponse);
  renderPresentation(result.presentation, result.meta);
});

resetBtn.addEventListener('click', () => {
  window.location.reload();
});

function appendChat(role, content) {
  const node = chatTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.role').textContent = role.toUpperCase();
  node.querySelector('.content').textContent = content;
  chatLog.appendChild(node);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function appendAgentEvent(event) {
  const node = agentTemplate.content.firstElementChild.cloneNode(true);
  node.querySelector('.agent-name').textContent = event.agent;
  node.querySelector('.agent-status').textContent = event.status;
  node.querySelector('.agent-message').textContent = event.message;
  node.querySelector('.agent-time').textContent = new Date(event.timestamp).toLocaleTimeString();
  agentTimeline.appendChild(node);
  agentTimeline.scrollTop = agentTimeline.scrollHeight;
}

function renderPresentation(sections, meta) {
  stage.innerHTML = '';
  stageMeta.textContent = `Render mode: ${meta.mode} | Validators: ${meta.validatorCount || 'scoped'} | Token strategy: ${meta.tokensSavedByPatchProtocol || meta.tokenStrategy}`;

  for (const section of sections) {
    const wrapper = document.createElement('section');
    wrapper.className = 'story-section';

    wrapper.innerHTML = `
      <h3>${section.title}</h3>
      <div class="content">${section.html}</div>
      <ul>
        <li><strong>Transition:</strong> ${section.transition}</li>
        <li><strong>Visual:</strong> ${section.image.prompt}</li>
        <li><strong>Data:</strong> ${section.chart.spec.title}</li>
        <li><strong>Verifier:</strong> ${section.verificationNote}</li>
      </ul>
      <div class="interaction">${section.interaction}</div>
    `;

    stage.appendChild(wrapper);
  }
}
