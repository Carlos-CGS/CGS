function classificarHeroi() {
    const nome = document.getElementById('nome').value;
    const xp = parseInt(document.getElementById('xp').value);
    let nivel;

    if (xp < 1000) {
        nivel = "Ferro";
    } else if (xp >= 1001 && xp <= 2000) {
        nivel = "Cristal";
    } else if (xp >= 2001 && xp <= 3000) {
        nivel = "Bronze";
    } else if (xp >= 3001 && xp <= 4000) {
        nivel = "Prata";
    } else if (xp >= 4001 && xp <= 5000) {
        nivel = "Ouro";
    } else if (xp >= 5001 && xp <= 6000) {
        nivel = "Platina";
    } else if (xp >= 6001 && xp <= 7000) {
        nivel = "Diamente";
    } else if (xp >= 7001 && xp <= 8000) {
        nivel = "Mestre";
    } else if (xp >= 8001 && xp <= 9000) {
        nivel = "Ascendente";
    } else if (xp >= 9001 && xp <= 10000) {
        nivel = "Imortal";
    } else {
        nivel = "Radiante";
    }

    document.getElementById('resultado').innerText = `O Herói de nome ${nome} está no nível de ${nivel}.`;
    limparCampo();
}

document.getElementById('nome').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        classificarHeroi();
        event.preventDefault();
    }
});

document.getElementById('xp').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        classificarHeroi();
        event.preventDefault();
    }
});

function limparCampo() {
    nome.value = '';
    xp.value = '';
}