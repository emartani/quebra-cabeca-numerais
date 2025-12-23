const images = Array.from({ length: 10 }, (_, i) => `images/${i+1}.jpg`);
let imgURL = "";
let score = 0;
let correctCount = 0;

const board = document.getElementById("board");
const piecesDiv = document.getElementById("pieces");
const scoreDiv = document.getElementById("score");
const restartBtn = document.getElementById("restart");
const startBtn = document.getElementById("start");

const soundAcerto = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const soundErro = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

// Converte número em extenso (0–100)
function numberToWords(num) {
  const unidades = ["zero","um","dois","três","quatro","cinco","seis","sete","oito","nove"];
  const especiais = {
    10:"dez",11:"onze",12:"doze",13:"treze",14:"quatorze",15:"quinze",
    16:"dezesseis",17:"dezessete",18:"dezoito",19:"dezenove"
  };
  const dezenas = ["","dez","vinte","trinta","quarenta","cinquenta","sessenta","setenta","oitenta","noventa"];
  
  if (num < 10) return unidades[num];
  if (num >= 10 && num < 20) return especiais[num];
  if (num === 100) return "cem";
  
  const dez = Math.floor(num/10);
  const uni = num % 10;
  if (uni === 0) return dezenas[dez];
  return dezenas[dez] + " e " + unidades[uni];
}

// Gera 9 números aleatórios únicos
function generateNumbers() {
  const operations = [];
  while (operations.length < 9) {
    const n = Math.floor(Math.random() * 101);
    if (!operations.some(op => op.a === n)) {
      operations.push({ q: numberToWords(n), a: n });
    }
  }
  return operations;
}

// Inicia partida
function startGame() {
  board.innerHTML = "";
  piecesDiv.innerHTML = "";
  score = 0;
  correctCount = 0;
  scoreDiv.textContent = "Pontuação: " + score;

  imgURL = images[Math.floor(Math.random() * images.length)];
  const operations = generateNumbers();

  // Cria células do tabuleiro (mostram o número por extenso)
  operations.forEach((op, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = op.q.toUpperCase(); // nome por extenso
    cell.dataset.answer = op.a;
    cell.dataset.index = index;

    cell.addEventListener("dragover", e => e.preventDefault());
    cell.addEventListener("drop", e => {
      const draggedAnswer = e.dataTransfer.getData("text/plain");
      const pieceIndex = parseInt(e.dataTransfer.getData("pieceIndex"), 10);

      if (draggedAnswer === cell.dataset.answer && !cell.classList.contains("correct")) {
        cell.classList.add("correct");
        cell.textContent = "";
        const row = Math.floor(pieceIndex / 3);
        const col = pieceIndex % 3;
        cell.style.backgroundImage = `url(${imgURL})`;
        cell.style.backgroundSize = '300% 300%';
        cell.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        correctCount++;
        score += 10;
        soundAcerto.play();
        scoreDiv.textContent = "Pontuação: " + score;

        if (window.draggedPiece && window.draggedPiece.parentElement) {
          window.draggedPiece.parentElement.removeChild(window.draggedPiece);
          window.draggedPiece = null;
        }

        if (correctCount === 9) triggerVictoryEffect();
      } else {
        score -= 5;
        soundErro.play();
        scoreDiv.textContent = "Pontuação: " + score;
      }
    });

    board.appendChild(cell);
  });

  // Embaralha peças
  const shuffled = [...operations].map((op, i) => ({ ...op, index: i }))
    .sort(() => Math.random() - 0.5);

  shuffled.forEach(({ q, a, index }) => {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.draggable = true;
    piece.dataset.answer = a;
    piece.dataset.index = index;

    const row = Math.floor(index / 3);
    const col = index % 3;
    piece.style.backgroundImage = `url(${imgURL})`;
    piece.style.backgroundSize = '300% 300%';
    piece.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

    const label = document.createElement("div");
    label.className = "label";
    label.textContent = a; // mostra o algarismo
    piece.appendChild(label);

    piece.addEventListener("dragstart", e => {
      window.draggedPiece = piece;
      e.dataTransfer.setData("text/plain", String(a));
      e.dataTransfer.setData("pieceIndex", String(index));
    });

    piece.addEventListener("dragend", () => {
      window.draggedPiece = null;
    });

    piecesDiv.appendChild(piece);
  });
}

// Efeito de vitória
function triggerVictoryEffect() {
  board.classList.add('victory');
  createConfetti(20);
  setTimeout(() => {
    board.classList.remove('victory');
    document.querySelectorAll('.confetti').forEach(c => c.remove());
  }, 2500);
}

function createConfetti(count = 20) {
  const colors = ['#ff6f61','#ffd54f','#81c784','#4fc3f7','#b39ddb'];
  const rect = board.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    const size = Math.floor(Math.random() * 10) + 6;
    conf.style.width = size + 'px';
    conf.style.height = size + 'px';
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    conf.style.left = (rect.left + Math.random() * rect.width) + 'px';
    conf.style.top = (rect.top + 10) + 'px';
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    document.body.appendChild(conf);
  }
}

startBtn.addEventListener("click", startGame);
restartBtn.addEventListener("click", startGame);
