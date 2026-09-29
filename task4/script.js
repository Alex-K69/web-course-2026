// Состояние игры
let hiddenCode = '';
let attemptLog = [];
let isFinished = false;

const codeField = document.getElementById('guess');
const submitButton = document.getElementById('check');
const restartButton = document.getElementById('new-game');
const noticeBox = document.getElementById('message');
const triesLabel = document.getElementById('attempts');
const logList = document.getElementById('history');

// Логика игры
function makeHiddenCode() {
  const pool = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let k = pool.length - 1; k > 0; k--) {
    const r = Math.floor(Math.random() * (k + 1));
    [pool[k], pool[r]] = [pool[r], pool[k]];
  }
  return pool.slice(0, 4).join('');
}

function findInputProblem(text) {
  if (!/^\d*$/.test(text)) return 'Вводите только цифры (без букв и символов).';
  if (text.length !== 4) return 'Нужно ввести ровно 4 цифры.';
  if (new Set(text).size !== 4) return 'Все цифры должны быть разными.';
  return null;
}

function scoreAttempt(code, attempt) {
  let exact = 0;
  let misplaced = 0;
  for (let pos = 0; pos < attempt.length; pos++) {
    if (attempt[pos] === code[pos]) {
      exact++;
    } else if (code.includes(attempt[pos])) {
      misplaced++;
    }
  }
  return { exact, misplaced };
}

function pickWordForm(count, form1, form2, form5) {
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastDigit === 1 && lastTwo !== 11) return form1;
  if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 10 || lastTwo >= 20)) return form2;
  return form5;
}

// Отрисовка
function setNotice(text, kind) {
  noticeBox.textContent = text;
  noticeBox.className = 'message' + (kind ? ' ' + kind : '');
}

function drawScreen() {
  triesLabel.textContent = attemptLog.length;

  logList.innerHTML = '';
  attemptLog.forEach(function (entry, idx) {
    const row = document.createElement('li');

    const numberPart = document.createElement('span');
    numberPart.className = 'num';
    numberPart.textContent = (idx + 1) + '. ' + entry.attempt;

    const scorePart = document.createElement('span');
    const bullsText = entry.exact + ' ' + pickWordForm(entry.exact, 'бык', 'быка', 'быков');
    const cowsText = entry.misplaced + ' ' + pickWordForm(entry.misplaced, 'корова', 'коровы', 'коров');
    scorePart.innerHTML = '→ <span class="bulls">' + bullsText + '</span>, <span class="cows">' + cowsText + '</span>';

    row.append(numberPart, scorePart);
    logList.appendChild(row);
  });
  logList.scrollTop = logList.scrollHeight;

  codeField.disabled = isFinished;
  submitButton.disabled = isFinished;
}

// Обработчики событий
function onSubmitAttempt() {
  if (isFinished) return;

  const typed = codeField.value.trim();
  const problem = findInputProblem(typed);
  if (problem) {
    setNotice(problem, 'error');
    return;
  }

  const { exact, misplaced } = scoreAttempt(hiddenCode, typed);
  attemptLog.push({ attempt: typed, exact, misplaced });
  codeField.value = '';

  if (exact === 4) {
    isFinished = true;
    setNotice('Победа! Угадано за ' + attemptLog.length + ' ' +
      pickWordForm(attemptLog.length, 'попытку', 'попытки', 'попыток'), 'win');
  } else {
    setNotice('');
  }
  drawScreen();
  if (!isFinished) codeField.focus();
}

function restartGame() {
  hiddenCode = makeHiddenCode();
  attemptLog = [];
  isFinished = false;
  codeField.value = '';
  setNotice('');
  drawScreen();
  codeField.focus();
}

submitButton.addEventListener('click', onSubmitAttempt);
codeField.addEventListener('keydown', function (evt) {
  if (evt.key === 'Enter') onSubmitAttempt();
});
restartButton.addEventListener('click', restartGame);

restartGame();
