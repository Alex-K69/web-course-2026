// Состояние игры
const rig = {
  chain: [],
  cursor: 0,
  mode: 'idle',
  session: 0,
  pending: new Set()
};

const SHOW_MS = 480;
const GAP_MS = 220;
const NEXT_ROUND_MS = 800;
const TONES = [262, 330, 392, 523];

const padButtons = Array.from(document.querySelectorAll('.pad'));
const startButton = document.getElementById('start');
const statusLine = document.getElementById('status');
const levelBadge = document.getElementById('level');

let audioCtx = null;

// Таймеры
function pause(ms) {
  return new Promise(function (resolve) {
    const id = setTimeout(function () {
      rig.pending.delete(id);
      resolve();
    }, ms);
    rig.pending.add(id);
  });
}

function dropAllTimers() {
  rig.pending.forEach(function (id) { clearTimeout(id); });
  rig.pending.clear();
}

// Звук
function beep(freq, durationMs, wave) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const amp = audioCtx.createGain();
    const t0 = audioCtx.currentTime;
    osc.type = wave || 'sine';
    osc.frequency.value = freq;
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + durationMs / 1000);
    osc.connect(amp);
    amp.connect(audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + durationMs / 1000 + 0.05);
  } catch (err) {
    audioCtx = null;
  }
}

// Отображение
function say(text, failed) {
  statusLine.textContent = text;
  statusLine.className = 'status' + (failed ? ' fail' : '');
}

function lockPads(locked) {
  padButtons.forEach(function (pad) { pad.disabled = locked; });
}

function glow(slot, ms) {
  padButtons[slot].classList.add('active');
  beep(TONES[slot], ms);
}

function dim(slot) {
  padButtons[slot].classList.remove('active');
}

function showLevel() {
  levelBadge.textContent = rig.chain.length;
}

// Ход игры
async function playChain(sessionId) {
  rig.mode = 'showing';
  rig.cursor = 0;
  lockPads(true);
  showLevel();
  say('Запоминайте…');

  await pause(NEXT_ROUND_MS);
  for (let i = 0; i < rig.chain.length; i++) {
    if (sessionId !== rig.session) return;
    glow(rig.chain[i], SHOW_MS);
    await pause(SHOW_MS);
    dim(rig.chain[i]);
    await pause(GAP_MS);
  }
  if (sessionId !== rig.session) return;

  rig.mode = 'listening';
  lockPads(false);
  say('Ваш ход: 1 из ' + rig.chain.length);
}

function growChain() {
  rig.chain.push(Math.floor(Math.random() * 4));
}

function startGame() {
  rig.session++;
  dropAllTimers();
  padButtons.forEach(function (pad) { pad.classList.remove('active'); });
  rig.chain = [];
  growChain();
  playChain(rig.session);
}

function endGame() {
  rig.session++;
  dropAllTimers();
  rig.mode = 'over';
  padButtons.forEach(function (pad) { pad.classList.remove('active'); });
  lockPads(true);
  beep(110, 600, 'sawtooth');
  say('Вы дошли до уровня ' + rig.chain.length, true);
}

function onPadPress(slot) {
  if (rig.mode !== 'listening') return;

  const sessionId = rig.session;
  glow(slot, 200);
  pause(200).then(function () { dim(slot); });

  if (slot !== rig.chain[rig.cursor]) {
    endGame();
    return;
  }

  rig.cursor++;
  if (rig.cursor === rig.chain.length) {
    rig.mode = 'showing';
    lockPads(true);
    growChain();
    playChain(sessionId);
  } else {
    say('Ваш ход: ' + (rig.cursor + 1) + ' из ' + rig.chain.length);
  }
}

padButtons.forEach(function (pad) {
  pad.addEventListener('click', function () {
    onPadPress(Number(pad.dataset.slot));
  });
});
startButton.addEventListener('click', startGame);
