let listaNumerosSorteados = [];
let limiteDeChutes = 100;
let numeroSecreto = gerarNumeroAleatorio();
let tentativas = 1;

function exibirTextoNaTela(tag, texto){
    let campo =  document.querySelector(tag);
    campo.innerHTML = texto;
    // Corrige leitura no mobile: só executa após interação do usuário
    if (window.responsiveVoice && window.responsiveVoice.speak) {
        // Em alguns navegadores mobile, o áudio só funciona após interação
        if (window._vozLiberada) {
            responsiveVoice.speak(texto,'Brazilian Portuguese Female', {rate:1.2});
        }
    }
}

// Libera o áudio no mobile após o primeiro toque
window._vozLiberada = false;
function liberarVozMobile() {
    if (!window._vozLiberada && window.responsiveVoice && window.responsiveVoice.speak) {
        window._vozLiberada = true;
        // Pequeno texto para liberar o áudio
        responsiveVoice.speak('Iniciando jogo', 'Brazilian Portuguese Female', {rate:1.2});
        // Remove o listener após liberar
        window.removeEventListener('touchend', liberarVozMobile);
        window.removeEventListener('click', liberarVozMobile);
    }
}
window.addEventListener('touchend', liberarVozMobile, {passive:true});
window.addEventListener('click', liberarVozMobile, {passive:true});

function exibirMensagemInicial(){
    exibirTextoNaTela('h1', 'Jogo numero secreto');
    exibirTextoNaTela('p', 'Escolha um numero entre 01 e 100');
}

exibirMensagemInicial();

function verificarChute(){
    let chute = document.querySelector('input').value;
    if (chute == numeroSecreto){
        exibirTextoNaTela('h1', 'Você Acertou!');
        let palavraTentativa = tentativas > 1 ? 'tentativas' : 'tentativas';
        let mensagemTentativas = `Você descobriu o número secreto ${numeroSecreto} com ${tentativas} ${palavraTentativa}!`;
        exibirTextoNaTela('p', mensagemTentativas);
        document.getElementById('reiniciar').removeAttribute('disabled');
    } else {
        let mensagem = '';
        if (chute > numeroSecreto){
            mensagem = `O número secreto é menor que ${chute}`;
        } else {
            mensagem = `O número secreto é maior que ${chute}`;
        }
        exibirTextoNaTela('p', mensagem);
        tentativas++;
        limparCampo();
    }
}

function gerarNumeroAleatorio(){
    let numeroEscolhido =  parseInt(Math.random() * limiteDeChutes + 1);
    let quantidadeDeElementosNaLista = listaNumerosSorteados.length;

    if (quantidadeDeElementosNaLista == limiteDeChutes){
        listaNumerosSorteados = [];
    }

    if (listaNumerosSorteados.includes(numeroEscolhido)){
        return gerarNumeroAleatorio();
    } else {
        listaNumerosSorteados.push(numeroEscolhido);
        return numeroEscolhido;
    }
}

function limparCampo(){
    let chute = document.querySelector('input');
    if (chute) {
        chute.value = '';
        chute.removeAttribute('disabled');
    }
}

function reiniciarJogo(){
    numeroSecreto = gerarNumeroAleatorio();
    tentativas = 1;
    exibirMensagemInicial();
    limparCampo();
    document.getElementById('reiniciar').setAttribute('disabled',true);
    let chute = document.querySelector('input');
    if (chute) {
        chute.focus();
    }
}