const state = {
    score:{
        playerScore: 0,
        computerScore: 0,
        scoreBox: document.getElementById("score_points")
    },
    cardSprites:{
        avatar: document.getElementById("card-image"),
        name: document.getElementById("card-name"),
        type: document.getElementById("card-type"),
    },
    fieldCards:{
        player: document.getElementById("player-field-card"),
        computer: document.getElementById("computer-field-card"),
    },
    playerSides:{
        player1: "player-cards",
        player1BOX: document.querySelector("#player-cards"),
        computer: "computer-cards",
        computerBOX: document.querySelector("#computer-cards"),
    },
    actions:{
    buttom: document.getElementById("next-duel"),   
    },
};

const pathImages = "./src/assets/icons/";
const cardData = [
    {
        id: 0,
        name: "Soldado",
        type: "exercito",
        img: `${pathImages}001.jpg`,
        WinOf: [0],
        LoseOf: [1,2,3,4,5,6],
    },
    {
        id: 1,
        name: "Cabo",
        type: "exercito",
        img: `${pathImages}002.jpg`,
        WinOf: [0],
        LoseOf: [2,3,4,5,6],
    },
    {
        id: 2,
        name: "Sargento",
        type: "exercito",
        img: `${pathImages}003.jpg`,
        WinOf: [0,1],
        LoseOf: [3,4,5,6],
    },
    {
        id: 3,
        name: "Sub Oficial",
        type: "exercito",
        img: `${pathImages}004.jpg`,
        WinOf: [0,1,2],
        LoseOf: [4,5,6],
    },
    {
        id: 4,
        name: "Fuzileiros Navais",
        type: "exercito",
        img: `${pathImages}005.jpg`,
        WinOf: [0,1,2,3],
        LoseOf: [5,6],
    },
    {
        id: 5,
        name: "Ataque Tropas",
        type: "exercito",
        img: `${pathImages}006.jpg`,
        WinOf: [0,1,2,3,4],
        LoseOf: [6],
    },
    {
        id: 6,
        name: "Boma Atomica",
        type: "bomba",
        img: `${pathImages}007.jpg`,
        WinOf: [0,1,2,3,4,5],
        LoseOf: [],
    },
];

async function getRandomCardId(){
    const randomIndex = Math.floor(Math.random() * cardData.length);
    return cardData[randomIndex].id;
};

async function createCardImage(IdCard, fieldSide){
    const cardImage = document.createElement("img");
    cardImage.setAttribute("height", "100px");
    cardImage.setAttribute("src", "./src/assets/icons/card-back-azul.jpg");
    cardImage.setAttribute("data-id", IdCard);
    cardImage.classList.add("card");

    if(fieldSide === state.playerSides.player1){
        cardImage.addEventListener("mouseover", ()=>{
            drawSelectCard(IdCard);
        });
        
        cardImage.addEventListener("click", ()=>{
            setCardsField(cardImage.getAttribute("data-id"));
        });
    };
    return cardImage;
};

async function setCardsField(cardId){
    await removeAllCardsImages();
    let computerCardId = await getRandomCardId();
    state.fieldCards.player.style.display = "block";
    state.fieldCards.computer.style.display = "block";

    await hiddenCardDetails();

    state.fieldCards.player.src = cardData[cardId].img;
    state.fieldCards.computer.src = cardData[computerCardId].img;

    let duelResults = await checkDuelResults(cardId, computerCardId);

    await updateScore();
    await drawButtom(duelResults);
};

async function hiddenCardDetails(){
    state.cardSprites.avatar.src = "";
    state.cardSprites.name.innerText = "";
    state.cardSprites.type.innerText = "";
}

async function drawButtom(duelResults){
    state.actions.buttom.innerText = duelResults;
    state.actions.buttom.style.display = "block";
};

async function updateScore(){
    state.score.scoreBox.innerText = `Vitorias: ${state.score.playerScore} | Derrotas: ${state.score.computerScore}`;
};

async function checkDuelResults(playerCardId, computerCardId){
    let duelResults = "Empate";
    let playerCard = cardData[playerCardId];

    if(playerCard.WinOf.includes(computerCardId)){
        duelResults = "Ganhou";
        state.score.playerScore++;
        await playAudio("explosao");
    }
    if(playerCard.LoseOf.includes(computerCardId)){
        duelResults = "Perdeu";
        state.score.computerScore++;
        await playAudio("explosao");
    }
    return duelResults;
};

async function removeAllCardsImages(){
    let {computerBOX, player1BOX} = state.playerSides;
    let imgElements = computerBOX.querySelectorAll("img");
    imgElements.forEach((img) =>img.remove());

    imgElements = player1BOX.querySelectorAll("img");
    imgElements.forEach((img) =>img.remove());
};

async function drawSelectCard(index){
    state.cardSprites.avatar.src = cardData[index].img;
    state.cardSprites.name.innerText = cardData[index].name;
    state.cardSprites.type.innerText = "Tipo : " + cardData[index].type;
};

async function drawCards(cardNumbers, fieldSide){
    for(let i=0; i < cardNumbers; i++){
        const randomIdCard = await getRandomCardId();
        const cardImage = await createCardImage(randomIdCard, fieldSide);

        document.getElementById(fieldSide).appendChild(cardImage);
    }
};

async function resetDuel(){
    state.cardSprites.avatar.src = "";
    state.actions.buttom.style.display = "none";

    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";
    init();
}

async function playAudio(audioNome){
    let audio = new Audio(`./src/assets/audios/${audioNome}.mp3`);
    audio.volume = 0.8;
    try{
      audio.play();  
    }catch{}
};

var audio = document.getElementById("bgm");
    audio.volume = 0.1;

function init() {
    state.fieldCards.player.style.display = "none";
    state.fieldCards.computer.style.display = "none";
    drawCards(5, state.playerSides.player1); 
    drawCards(5, state.playerSides.computer);

    const bgm = document.getElementById("bgm");
    bgm.play();
}
init();