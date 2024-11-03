const state = {
    view: {
        squares: document.querySelectorAll(".square"),
        enemy: document.querySelector(".enemy"),
        ovo: document.querySelector(".ovo"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
        finalScore: document.getElementById("finalScore"), 
    },
    values: {
        gameVelocity: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 30,
    },
    actions: {
        timerId: null,
        countDownTimerId: null,
    }
};

// Objeto para gerenciar sons
const audioMap = {};

// Função para gerar áudio do jogo
function playSound(audioNome) {
    // Verifica se o áudio já está carregado
    if (!audioMap[audioNome]) {
        audioMap[audioNome] = new Audio(`./src/audio/${audioNome}.mp3`);
        audioMap[audioNome].volume = 0.2;
    }

    // Para o áudio se já estiver tocando
    if (!audioMap[audioNome].paused) {
        audioMap[audioNome].currentTime = 0; // Reinicia o áudio
    }
    
    audioMap[audioNome].play();
}

// Função para verificar o tempo e mensagem de vitória
function countDown() {
    state.values.currentTime--;
    state.view.timeLeft.textContent = state.values.currentTime;

    if (state.values.currentTime <= 0) {
        clearInterval(state.actions.countDownTimerId);
        clearInterval(state.actions.timerId);
        const divVitoria = document.getElementById('mensagemVitoria');
        state.view.finalScore.textContent = state.values.result; 
        divVitoria.classList.remove('oculto'); 
        document.getElementById('container').classList.add('oculto'); 
    }
}

// Gera um randomico para aparecer o inimigo
function randomSquare() {
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });
    let randomNumber = Math.floor(Math.random() * state.view.squares.length);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id;
}

function moveEnemy() {
    // Limpa o intervalo atual, se existir, antes de iniciar um novo
    clearInterval(state.actions.timerId);
    state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
}

// Verifica onde está o inimigo nos quadrantes
function addListenerHitBox() {
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if (square.id === state.values.hitPosition) {
                state.values.result += 10;
                state.view.score.textContent = state.values.result;
                square.classList.add("ovo");
                playSound("poin");
                playSound("cocorico");
            }
        });
    });
}

// Função para reiniciar o jogo
function reiniciarJogo() {
    state.values.result = 0;
    state.values.currentTime = 30;
    state.view.score.textContent = state.values.result;
    state.view.timeLeft.textContent = state.values.currentTime;

    // Oculta a mensagem de vitória e exibe o contêiner do jogo novamente
    document.getElementById('mensagemVitoria').classList.add('oculto');
    document.getElementById('container').classList.remove('oculto');
    
    // Remove os ovos deixados pelo jogo anterior
    state.view.squares.forEach(square => { square.classList.remove("ovo"); });

    // Reinicia os timers
    clearInterval(state.actions.countDownTimerId);
    clearInterval(state.actions.timerId);
    
    // Inicia novamente o jogo
    initialize();
}

// Adiciona o evento ao botão de reinício
document.getElementById('reiniciarJogo').addEventListener('click', reiniciarJogo);

function initialize() {
    moveEnemy();
    
    // Inicia o temporizador de contagem regressiva
    state.actions.countDownTimerId = setInterval(countDown, 1000);
    
    addListenerHitBox();
    playSound("musicFundo");
}

// Inicia o jogo pela primeira vez
initialize();
