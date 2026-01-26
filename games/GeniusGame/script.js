// Light Pop Memory - Lógica principal
const app = document.getElementById('app');

// Estados globais do jogo
let state = {
    screen: 'start', // start | game | result
    player: '',
    difficulty: 'facil',
    round: 1,
    score: 0,
    sequence: [],
    playerInput: [],
    gridSize: 2,
    colors: [],
    isMuted: false,
    canInput: false,
};

const difficulties = {
    facil: { label: 'Fácil', btns: 4, grid: [2,2], points: 2 },
    medio: { label: 'Médio', btns: 9, grid: [3,3], points: 3 },
    dificil: { label: 'Difícil', btns: 12, grid: [3,4], points: 5 },
};

// Lista de imagens dos avatares
const avatarList = [
    'assets/img/avatarPython.jpeg',
    'assets/img/avatarCsharp.jpeg',
    'assets/img/avatarJava.jpeg',
    'assets/img/avatarJavaScript.jpeg',
    'assets/img/avatarHtml.jpeg',
    'assets/img/avatarCss.jpeg',
    'assets/img/avatarPhp.jpeg',
    'assets/img/avatarRuby.jpeg',
    'assets/img/avatarSql.jpeg',
    'assets/img/avatarPerl.jpeg',
    'assets/img/avatarYaml.jpeg',
    'assets/img/avatarJson.jpeg',
];

// Sons
const audioClick = new Audio('assets/sounds/click.mp3');
const audioGameOver = new Audio('assets/sounds/gameover.mp3');
const audioMusic = new Audio('assets/sounds/music-game.mp3');
audioMusic.loop = true;
audioMusic.volume = 0.25;

function playSound(type) {
    if (state.isMuted) return;
    if (type === 'click') {
        audioClick.currentTime = 0;
        audioClick.play();
    } else if (type === 'gameover') {
        audioGameOver.currentTime = 0;
        audioGameOver.play();
    }
}

function render() {
    // Troca o fundo da div do game conforme o estado
    if (state.screen === 'game') {
        app.classList.add('in-game');
    } else {
        app.classList.remove('in-game');
    }
    if (state.screen === 'start') renderStart();
    else if (state.screen === 'game') renderGame();
    else if (state.screen === 'result') renderResult();
    renderFloatingMenuBtn();
}

function renderStart() {
    app.innerHTML = `
        <div class="header">
            <p>Memorize e repita a sequência de luzes!</p>
        </div>
        <div class="start-center">
            <input id="playerName" type="text" placeholder="Seu nome" value="${state.player}" required />
            <div style="width:100%;text-align:center;">
                <label for="difficulty" style="display:block;margin-bottom:2px;">Dificuldade:</label>
                <select id="difficulty">
                    <option value="facil">Fácil</option>
                    <option value="medio">Médio</option>
                    <option value="dificil">Difícil</option>
                </select>
            </div>
            <button id="startBtn">Iniciar Jogo</button>
        </div>
    `;
    document.getElementById('startBtn').onclick = startGame;
    document.getElementById('difficulty').value = state.difficulty;
}

function startGame() {
    const name = document.getElementById('playerName').value.trim();
    if (!name) {
        alert('Digite seu nome para jogar!');
        return;
    }
    state.player = name;
    state.difficulty = document.getElementById('difficulty').value;
    const diff = difficulties[state.difficulty];
    state.gridSize = diff.grid;
    // Seleciona os avatares corretos para cada dificuldade
    if (state.difficulty === 'facil') {
        state.colors = [
            'assets/img/avatarPython.jpeg',
            'assets/img/avatarCsharp.jpeg',
            'assets/img/avatarJava.jpeg',
            'assets/img/avatarJavaScript.jpeg',
        ];
    } else {
        state.colors = avatarList.slice(0, diff.btns);
    }
    state.round = 1;
    state.score = 0;
    state.sequence = [];
    state.playerInput = [];
    state.screen = 'game';
    render();
    // Inicia música de fundo
    if (!state.isMuted) {
        audioMusic.currentTime = 0;
        audioMusic.play();
    }
    setTimeout(() => nextRound(), 500);
}

function renderGame() {
    const diff = difficulties[state.difficulty];
    const gridSize = diff.btns;
    app.innerHTML = `
        <div class="header" style="display:flex;justify-content:center;align-items:center;gap:32px;">
            <div>Rodada: <b>${state.round}</b></div>
            <div>Pontuação: <b>${state.score}</b></div>
            <button class="mute-btn" id="muteBtn">${state.isMuted ? '🔇' : '🔊'}</button>
        </div>
        <div class="memory-grid" data-size="${gridSize}" style="grid-template-columns: repeat(${state.gridSize[1]}, 1fr); grid-template-rows: repeat(${state.gridSize[0]}, 1fr);">
            ${state.colors.map((img, i) => `
                <button class="memory-btn" id="btn${i}" style="background:#222; padding:0; display:flex; align-items:center; justify-content:center;">
                    <img src="${img}" alt="avatar" style="width:180%;height:180%;object-fit:contain;pointer-events:none;filter:drop-shadow(0 0 2px #fff8); display:block; margin:auto;">
                </button>
            `).join('')}
        </div>
        <div class="restart-btn-container" style="display:flex; justify-content:center; margin-top:24px;">
            <button id="restartBtn" style="margin:0 auto;">Reiniciar</button>
        </div>
    `;
    document.getElementById('muteBtn').onclick = toggleMute;
    document.getElementById('restartBtn').onclick = restartGame;
    state.colors.forEach((_, i) => {
        document.getElementById('btn'+i).onclick = () => handleInput(i);
    });
    if (!state.canInput) {
        state.colors.forEach((_, i) => {
            document.getElementById('btn'+i).disabled = true;
        });
    }
}

function nextRound() {
    state.canInput = false;
    state.playerInput = [];
    // Adiciona novo passo à sequência
    state.sequence.push(Math.floor(Math.random() * state.colors.length));
    showSequence(0);
}

function showSequence(idx) {
    if (idx >= state.sequence.length) {
        state.canInput = true;
        render();
        return;
    }
    const btnIdx = state.sequence[idx];
    const btn = document.getElementById('btn'+btnIdx);
    btn.classList.add('active');
    playSound('click');
    setTimeout(() => {
        btn.classList.remove('active');
        setTimeout(() => showSequence(idx+1), 400);
    }, 600);
}

function handleInput(idx) {
    if (!state.canInput) return;
    state.playerInput.push(idx);
    const btn = document.getElementById('btn'+idx);
    btn.classList.add('active');
    // Verifica input
    const step = state.playerInput.length - 1;
    if (idx !== state.sequence[step]) {
        // Errou
        playSound('gameover');
        audioMusic.pause();
        state.screen = 'result';
        setTimeout(() => {
            btn.classList.remove('active');
            render();
        }, 300);
        return;
    } else {
        playSound('click');
    }
    setTimeout(() => btn.classList.remove('active'), 200);
    if (state.playerInput.length === state.sequence.length) {
        // Acertou rodada
        state.score += difficulties[state.difficulty].points;
        state.round++;
        setTimeout(() => nextRound(), 800);
    }
}

function renderResult() {
    const diff = difficulties[state.difficulty];
    app.innerHTML = `
        <div class="result">
            <h2>Fim de Jogo!</h2>
            <div>Jogador: <b>${state.player}</b></div>
            <div>Dificuldade: <b>${diff.label}</b></div>
            <div>Rodadas concluídas: <b>${state.round-1}</b></div>
            <div>Pontuação final: <b>${state.score}</b></div>
        </div>
        <div class="result-buttons">
            <button id="playAgainBtn">Jogar Novamente</button>
            <button id="backBtn">Voltar ao Início</button>
        </div>
    `;
    document.getElementById('playAgainBtn').onclick = () => {
        state.screen = 'game';
        state.round = 1;
        state.score = 0;
        state.sequence = [];
        state.playerInput = [];
        render();
        setTimeout(() => nextRound(), 500);
    };

    document.getElementById('backBtn').onclick = () => {
        state.screen = 'start';
        render();
    };
}

// Botão flutuante para voltar ao menu principal
function renderFloatingMenuBtn() {
    let btn = document.getElementById('floatingMenuBtn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'floatingMenuBtn';
        btn.className = 'floating-menu-btn';
        btn.title = 'Voltar ao menu principal';
        btn.innerHTML = '🏠';
        document.body.appendChild(btn);
    }
    btn.onclick = () => {
        window.location.href = 'https://carlos-cgs.github.io/CGS/';
    };
    btn.style.display = 'flex';
}

function restartGame() {
    state.screen = 'start';
    audioMusic.pause();
    render();
}

function toggleMute() {
    state.isMuted = !state.isMuted;
    if (state.isMuted) {
        audioMusic.pause();
    } else if (state.screen === 'game') {
        audioMusic.currentTime = 0;
        audioMusic.play();
    }
    render();
}

// Inicialização
render();
