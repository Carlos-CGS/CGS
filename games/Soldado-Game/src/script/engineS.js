const state = {
    view: {
        squares: document.querySelectorAll(".square"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
    },
    values: {
        gameVelocity: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 30,
    },
    actions: {
        timerId: setInterval(randomSquare, 1000),
        countDownTimerId: setInterval(countDown, 1000),
    }
};

// Função para gerar áudio do jogo
function playSound(audioNome) {
    let audio = new Audio(`./src/audio/${audioNome}.mp3`);
    audio.volume = 0.2;
    audio.play();
}

// Função para verificar o tempo e exibir mensagem de vitória
function countDown() {
    state.values.currentTime--;
    state.view.timeLeft.textContent = state.values.currentTime;
    
    if (state.values.currentTime <= 0) {
        clearInterval(state.actions.countDownTimerId);
        clearInterval(state.actions.timerId);
        
        // Atualizar o campo score-final diretamente no DOM
        let scoreFinalElement = document.getElementById('score-final');
        scoreFinalElement.textContent = state.values.result; // Atualiza corretamente o score final
        
        // Exibir a mensagem de vitória
        let divVitoria = document.getElementById('mensagemVitoria');
        divVitoria.classList.remove('oculto');
        
        // Esconder o container principal
        document.getElementById('container').classList.add('oculto');

        // Ocultar o botão "Reiniciar Jogo" da página principal
        state.view.restartButton.style.display = 'none';

        playSound("gameOver");
    }
}

// Função para gerar posição aleatória do inimigo
function randomSquare() {
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });
    
    let randomNumber = Math.floor(Math.random() * 21);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id;
}

// Função para mover o inimigo a cada intervalo de tempo
function moveEnemy() {
    state.values.timerId = setInterval(randomSquare, state.values.gameVelocity);
}

// Verifica se o jogador clicou no quadrado correto e atualiza o score
function addListenerHitBox() {
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if (square.id === state.values.hitPosition) {
                state.values.result += 10; // Incrementa o score
                state.view.score.textContent = state.values.result; // Atualiza o campo de score
                state.values.hitPosition = null;

                playSound("somRifle");
            }
        });
    });
}

// Inicializa o jogo
function initialize() {
    moveEnemy();
    addListenerHitBox();
    playSound("fundoGame");
}

initialize();


