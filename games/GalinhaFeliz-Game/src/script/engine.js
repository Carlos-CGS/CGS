/**
 * Jogo da Galinha Feliz
 * Objetivo: Clicar nas galinhas para pontuar antes do tempo acabar
 * Mecânica: Os ovos eclodem ao final do tempo
 */

// ==================== CONSTANTES ====================
const CONFIG = {
    GAME_DURATION: 30, // segundos
    INITIAL_GAME_VELOCITY: 1000, // ms entre aparições
    POINTS_PER_HIT: 10,
    AUDIO_VOLUME: 0.2,
    HATCH_ANIMATION_DURATION: 3000, // ms para eclodir todos os ovos
    HATCH_DISPLAY_DELAY: 500, // ms antes de mostrar resultado final
};

const SELECTORS = {
    SQUARES: '.square',
    CONTAINER: '#container',
    GAME_OVER_DIALOG: '#mensagemVitoria',
    SCORE_DISPLAY: '#score',
    TIME_DISPLAY: '#time-left',
    FINAL_SCORE_DISPLAY: '#finalScore',
    RESTART_BUTTON: '#reiniciarJogo',
};

const CLASS_NAMES = {
    ENEMY: 'enemy',
    EGG: 'ovo',
    HIDDEN: 'oculto',
};

// ==================== ESTADO DO JOGO ====================
const GameState = {
    // Elementos DOM
    elements: {
        squares: null,
        scoreDisplay: null,
        timeDisplay: null,
        finalScoreDisplay: null,
        gameOverDialog: null,
        container: null,
        restartButton: null,
    },
    
    // Valores do jogo
    values: {
        currentScore: 0,
        remainingTime: CONFIG.GAME_DURATION,
        currentEnemyPosition: '',
        gameVelocity: CONFIG.INITIAL_GAME_VELOCITY,
        isGameRunning: false,
        userInteracted: false, // Flag para permitir autoplay de áudio
    },
    
    // Gerenciamento de timers
    timers: {
        enemyMovement: null,
        countdown: null,
    },
};

// ==================== GERENCIADOR DE ÁUDIO ====================
const AudioManager = {
    cache: {},
    
    /**
     * Reproduz um som do jogo
     * Respeita a política de autoplay dos navegadores modernos:
     * Áudio só pode ser reproduzido após interação do usuário com a página
     * @param {string} soundName - Nome do arquivo de áudio (sem extensão)
     */
    play(soundName) {
        // Se o usuário ainda não interagiu com a página, ignora reprodução
        if (!GameState.values.userInteracted) {
            return;
        }
        
        if (!this.cache[soundName]) {
            this.cache[soundName] = new Audio(`./src/audio/${soundName}.mp3`);
            this.cache[soundName].volume = CONFIG.AUDIO_VOLUME;
        }
        
        const audio = this.cache[soundName];
        // Reinicia o áudio se já estiver tocando
        if (!audio.paused) {
            audio.currentTime = 0;
        }
        
        audio.play().catch(error => console.warn(`Erro ao reproduzir som: ${error}`));
    },
    
    /**
     * Para a reprodução de um som
     * @param {string} soundName - Nome do arquivo de áudio
     */
    stop(soundName) {
        if (this.cache[soundName]) {
            this.cache[soundName].pause();
            this.cache[soundName].currentTime = 0;
        }
    },
};

// ==================== GERENCIADOR DE DOM ====================
const DOMManager = {
    /**
     * Inicializa referências aos elementos DOM
     */
    initialize() {
        GameState.elements.squares = document.querySelectorAll(SELECTORS.SQUARES);
        GameState.elements.scoreDisplay = document.querySelector(SELECTORS.SCORE_DISPLAY);
        GameState.elements.timeDisplay = document.querySelector(SELECTORS.TIME_DISPLAY);
        GameState.elements.finalScoreDisplay = document.querySelector(SELECTORS.FINAL_SCORE_DISPLAY);
        GameState.elements.gameOverDialog = document.querySelector(SELECTORS.GAME_OVER_DIALOG);
        GameState.elements.container = document.querySelector(SELECTORS.CONTAINER);
        GameState.elements.restartButton = document.querySelector(SELECTORS.RESTART_BUTTON);
        
        this.validateElements();
    },
    
    /**
     * Valida se todos os elementos foram encontrados
     */
    validateElements() {
        const requiredElements = [
            'squares', 'scoreDisplay', 'timeDisplay', 'finalScoreDisplay',
            'gameOverDialog', 'container', 'restartButton'
        ];
        
        requiredElements.forEach(element => {
            if (!GameState.elements[element]) {
                console.error(`Elemento não encontrado: ${element}`);
            }
        });
    },
    
    /**
     * Atualiza a exibição da pontuação
     */
    updateScore() {
        if (GameState.elements.scoreDisplay) {
            GameState.elements.scoreDisplay.textContent = GameState.values.currentScore;
        }
    },
    
    /**
     * Atualiza a exibição do tempo
     */
    updateTime() {
        if (GameState.elements.timeDisplay) {
            GameState.elements.timeDisplay.textContent = GameState.values.remainingTime;
        }
    },
    
    /**
     * Mostra o diálogo de fim de jogo
     */
    showGameOverDialog() {
        if (GameState.elements.gameOverDialog && GameState.elements.container) {
            GameState.elements.finalScoreDisplay.textContent = GameState.values.currentScore;
            GameState.elements.gameOverDialog.classList.remove(CLASS_NAMES.HIDDEN);
            GameState.elements.container.classList.add(CLASS_NAMES.HIDDEN);
        }
    },
    
    /**
     * Oculta o diálogo de fim de jogo
     */
    hideGameOverDialog() {
        if (GameState.elements.gameOverDialog && GameState.elements.container) {
            GameState.elements.gameOverDialog.classList.add(CLASS_NAMES.HIDDEN);
            GameState.elements.container.classList.remove(CLASS_NAMES.HIDDEN);
        }
    },
    
    /**
     * Remove uma classe de todos os elementos
     */
    removeClassFromAll(selector, className) {
        document.querySelectorAll(selector).forEach(element => {
            element.classList.remove(className);
        });
    },
};

// ==================== LÓGICA DO JOGO ====================
const GameLogic = {
    /**
     * Move a galinha para um novo local aleatório
     */
    moveEnemy() {
        // Remove a galinha anterior
        DOMManager.removeClassFromAll(SELECTORS.SQUARES, CLASS_NAMES.ENEMY);
        
        if (!GameState.values.isGameRunning) return;
        
        // Obtém apenas os quadrados disponíveis (sem ovos)
        const availableSquares = Array.from(GameState.elements.squares).filter(
            square => !square.classList.contains(CLASS_NAMES.EGG)
        );
        
        if (availableSquares.length === 0) return;
        
        // Seleciona um quadrado aleatório
        const randomIndex = Math.floor(Math.random() * availableSquares.length);
        const selectedSquare = availableSquares[randomIndex];
        
        selectedSquare.classList.add(CLASS_NAMES.ENEMY);
        GameState.values.currentEnemyPosition = selectedSquare.id;
    },
    
    /**
     * Inicia o movimento contínuo da galinha
     */
    startEnemyMovement() {
        GameState.timers.enemyMovement = setInterval(() => {
            this.moveEnemy();
        }, GameState.values.gameVelocity);
    },
    
    /**
     * Para o movimento da galinha
     */
    stopEnemyMovement() {
        if (GameState.timers.enemyMovement) {
            clearInterval(GameState.timers.enemyMovement);
            GameState.timers.enemyMovement = null;
        }
    },
    
    /**
     * Manipula o clique em um quadrado
     */
    handleSquareClick(square) {
        if (square.id === GameState.values.currentEnemyPosition) {
            // Acerto!
            GameState.values.currentScore += CONFIG.POINTS_PER_HIT;
            square.classList.add(CLASS_NAMES.EGG);
            
            // Toca sons de pontuação
            AudioManager.play('poin');
            AudioManager.play('cocorico');
            
            DOMManager.updateScore();
        }
    },
    
    /**
     * Adiciona listeners a todos os quadrados
     */
    attachSquareListeners() {
        GameState.elements.squares.forEach(square => {
            square.addEventListener('mousedown', () => this.handleSquareClick(square));
        });
    },
    
    /**
     * Decrementa o tempo do jogo
     */
    decrementTime() {
        GameState.values.remainingTime--;
        DOMManager.updateTime();
        
        if (GameState.values.remainingTime <= 0) {
            this.endGame();
        }
    },
    
    /**
     * Finaliza o jogo e inicia animação de eclosão
     */
    endGame() {
        GameState.values.isGameRunning = false;
        
        if (GameState.timers.countdown) {
            clearInterval(GameState.timers.countdown);
            GameState.timers.countdown = null;
        }
        
        this.stopEnemyMovement();
        this.animateEggHatching();
    },
    
    /**
     * Anima os ovos eclodirem progressivamente
     */
    animateEggHatching() {
        const eggs = Array.from(GameState.elements.squares).filter(
            square => square.classList.contains(CLASS_NAMES.EGG)
        );
        
        if (eggs.length === 0) {
            // Sem ovos, mostra resultado imediatamente
            setTimeout(() => DOMManager.showGameOverDialog(), CONFIG.HATCH_DISPLAY_DELAY);
            return;
        }
        
        const intervalBetweenHatches = CONFIG.HATCH_ANIMATION_DURATION / eggs.length;
        let eggIndex = 0;
        
        const hatchInterval = setInterval(() => {
            if (eggIndex < eggs.length) {
                const egg = eggs[eggIndex];
                egg.classList.remove(CLASS_NAMES.EGG);
                egg.classList.add(CLASS_NAMES.ENEMY);
                AudioManager.play('poin');
                eggIndex++;
            } else {
                clearInterval(hatchInterval);
                
                // Mostra resultado final
                setTimeout(() => {
                    DOMManager.removeClassFromAll(SELECTORS.SQUARES, CLASS_NAMES.ENEMY);
                    DOMManager.showGameOverDialog();
                }, CONFIG.HATCH_DISPLAY_DELAY);
            }
        }, intervalBetweenHatches);
    },
    
    /**
     * Reinicia o jogo
     */
    restart() {
        // Reseta valores
        GameState.values.currentScore = 0;
        GameState.values.remainingTime = CONFIG.GAME_DURATION;
        GameState.values.isGameRunning = true;
        
        // Limpa elementos
        DOMManager.removeClassFromAll(SELECTORS.SQUARES, CLASS_NAMES.ENEMY);
        DOMManager.removeClassFromAll(SELECTORS.SQUARES, CLASS_NAMES.EGG);
        
        // Atualiza exibição
        DOMManager.updateScore();
        DOMManager.updateTime();
        DOMManager.hideGameOverDialog();
        
        // Limpa timers antigos
        this.stopEnemyMovement();
        if (GameState.timers.countdown) {
            clearInterval(GameState.timers.countdown);
        }
        
        // Inicia o jogo
        this.initialize();
    },
    
    /**
     * Inicializa o jogo
     */
    initialize() {
        this.startEnemyMovement();
        
        GameState.timers.countdown = setInterval(() => {
            this.decrementTime();
        }, 1000);
        
        this.moveEnemy();
        AudioManager.play('musicFundo');
    },
};

// ==================== FUNÇÕES AUXILIARES ====================
/**
 * Detecta primeira interação do usuário para permitir autoplay de áudio
 * Necessário por causa da política de autoplay dos navegadores modernos
 */
function enableAudioOnFirstInteraction() {
    if (!GameState.values.userInteracted) {
        GameState.values.userInteracted = true;
        // Remove os listeners após primeira interação
        document.removeEventListener('click', enableAudioOnFirstInteraction);
        document.removeEventListener('touchstart', enableAudioOnFirstInteraction);
        document.removeEventListener('keydown', enableAudioOnFirstInteraction);
    }
}

// ==================== INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
    // Aguarda interação do usuário para permitir áudio
    document.addEventListener('click', enableAudioOnFirstInteraction);
    document.addEventListener('touchstart', enableAudioOnFirstInteraction);
    document.addEventListener('keydown', enableAudioOnFirstInteraction);
    
    // Inicializa gerenciadores
    DOMManager.initialize();
    GameLogic.attachSquareListeners();
    
    // Marca jogo como ativo
    GameState.values.isGameRunning = true;
    
    // Inicia o jogo
    GameLogic.initialize();
    
    // Adiciona listener para botão de reinício
    if (GameState.elements.restartButton) {
        GameState.elements.restartButton.addEventListener('click', () => {
            GameLogic.restart();
        });
    }
});
