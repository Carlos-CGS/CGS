const state = {
    view:{
        squares: document.querySelectorAll(".square"),
        enemy: document.querySelector(".enemy"),
        ovo: document.querySelector(".ovo"),
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
    },
    values:{
        gameVelocity: 1000,
        hitPosition: 0,
        result: 0,
        currentTime: 30,
    },
    actions:{
        timerId: setInterval(randomSquare, 1000),
        countDownTimerId: setInterval(countDown, 1000),
    }
};

//Função para gerar audio do jogo
function playSound(audioNome){
    let audio = new Audio(`./src/audio/${audioNome}.mp3`);
    audio.volume = 0.2;
    audio.play();
};

//Função para verificar o tempo e mensagem vitória
function countDown(){
    state.values.currentTime--;
    state.view.timeLeft.textContent = state.values.currentTime;
    if (state.values.currentTime <= 0){
        clearInterval(state.actions.countDownTimerId)
        clearInterval(state.actions.timerId)
        const divVitoria = document.getElementById('mensagemVitoria');
        divVitoria.classList.remove('oculto');
        document.getElementById('container').classList.add('oculto');
        state.view.score.textContent = state.values.result;
    };
};

// Gera um randomico para aparecer o inimigo
function randomSquare(){
    state.view.squares.forEach((square) => {
        square.classList.remove("enemy");
    });
    let randomNumber = Math.floor(Math.random()*60);
    let randomSquare = state.view.squares[randomNumber];
    randomSquare.classList.add("enemy");
    state.values.hitPosition = randomSquare.id; 
};

function moveEnemy(){
    state.values.timerId = setInterval(randomSquare, state.values.gameVelocity);
};

// Verifica onde está o inimigo nos quadrantes
function addListenerHitBox(){
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if(square.id === state.values.hitPosition){
                state.values.result = state.values.result + 10;
                state.view.score.textContent = state.values.result;
                state.view.classList.add("ovo");
                playSound("poin");
                playSound("cocorico");
            };
        });
    });
};

function initialize(){
    moveEnemy();
    addListenerHitBox(); 
    playSound("musicFundo");
};

initialize();


