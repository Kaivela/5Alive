import Enquirer from "enquirer";

//déclaration de variables globaless
let deck = [];
let pile = [];
let currentPlayer = 0;
let playerHands = [];
let playerLives = [];
let playerCount = 0;
let totalPile = 0;
let total = 0;

//---------------------------------------------

// demande combien de joueurs jouent
const enquirer = new Enquirer();
const response = await enquirer.prompt({
  type: "input",
  name: "joueurs",
  message: "combien de joueurs etes vous?",
});
playerCount = response.joueurs;

initDeck();
initHandsAndLives();
newRound();
//Tour du joueur courant
while (!isGameOver()) {
  console.log(
    "\n--------------" + "\nJOUEUR " + (currentPlayer + 1) + "\n--------------"
  );
  totalPile = computePile();
  const currentHand = playerHands[currentPlayer];

  //si ne peux pas jouer
  if (canPlay(totalPile, currentHand) == false) {
    // perd une vie -->
    playerLives[currentPlayer]--;
    console.log(
      "joueur " +
        (currentPlayer + 1) +
        " perd une vie ! nombre de vie restant : " +
        playerLives[currentPlayer] +
        "\nle total de la pile revient à 0"
    );
    transferPileToDeck();
    console.log({ total: computePile() });
    nextTurn();
    continue; // redémarre la boucle au début
  }

  // selection d'une carte valide
  const playerHand = currentHand.map((card, index) => {
    //
    return {
      message: String(card),
      name: String(index),
      value: String(index),
    };
  });

  const select = await enquirer.prompt({
    type: "select",
    name: "card",
    message: " : choisis une carte à jouer",
    choices: playerHand,
  });
  let cardPlayedIndex = Number(select.card);
  let currentPlayedCard = currentHand[cardPlayedIndex];

  //joue la carte --> fait son effet --> passe au tour/round suivant
  if (currentPlayedCard + totalPile > 21) {
    console.log("interdit de jouer cette carte !!\nSelectionne en une autre :");
  } else {
    playCard(cardPlayedIndex);
    console.log(
      "joueur " + (currentPlayer + 1) + " joue : " + currentPlayedCard
    );

    //si carte joué == skip
    if (currentPlayedCard == "skip") {
      if (currentPlayer + 1 == playerCount) {
        console.log("le joueur 1 passe son tour !");
      } else {
        console.log("le joueur " + (currentPlayer + 2) + " passe son tour !");
      }
      nextTurn();
    }

    //si carte joué == "+1" ou "+2"
    if (currentPlayedCard == "+ 1") {
      eachPlayerDrawCards(1);
    }
    if (currentPlayedCard == "+ 2") {
      eachPlayerDrawCards(2);
    }

    //si plus de cartes en main après avoir joué
    if (noCardInHand()) {
      console.log(
        "le joueur " +
          (currentPlayer + 1) +
          " n'a plus de cartes en main !" +
          "\nChaque autre joueur perd une vie!\n"
      );
      decreaseOpponentsLives();
      console.log("***Rappel :");
      for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
        console.log(
          "Nombre de vie du joueur " +
            (playerIndex + 1) +
            ": " +
            playerLives[playerIndex]
        );
      }
      newRound();
    }
    console.log({ total: computePile() });
    nextTurn();
  }
}
//---------------------------------------------

//création des cartes + ajout au deck
function initDeck() {
  for (let deckIndex = 0; deckIndex < 69; deckIndex++) {
    //deckIndex sera de 77 quand terminé
    if (deckIndex < 8) {
      // 8 cartes : Zéro
      deck.push(0);
    } else if (deckIndex < 16) {
      // 8 cartes : Un
      deck.push(1);
    } else if (deckIndex < 24) {
      // 8 cartes : Deux
      deck.push(2);
    } else if (deckIndex < 32) {
      // 8 cartes : Trois
      deck.push(3);
    } else if (deckIndex < 40) {
      // 8 cartes : Quatres
      deck.push(4);
    } else if (deckIndex < 44) {
      // 4 cartes : Cinq
      deck.push(5);
    } else if (deckIndex < 46) {
      // 2 cartes : Six
      deck.push(6);
    } else if (deckIndex < 47) {
      // 1 carte : Sept
      deck.push(7);
    } else if (deckIndex < 50) {
      // 3 carte : Egal Zéro
      deck.push("= 0");
    } else if (deckIndex < 52) {
      // 2 carte : Egal Dix
      deck.push("= 10");
    } else if (deckIndex < 57) {
      // 5 cartes : Egal Vingt-et-un
      deck.push("= 21");
    } else if (deckIndex < 59) {
      // 2 cartes : chaque joueur pioche 1 carte
      deck.push("+ 1");
    } else if (deckIndex < 61) {
      // 2 cartes : chaque joueur pioche 1 carte
      deck.push("+ 2");
    } else if (deckIndex < 65) {
      // 4 cartes : Passer son tour
      deck.push("pass");
    } else {
      // 4 cartes : Passer le tour du joueur suivant
      deck.push("skip");
    }
  }
  // cartes a ajouter : 8 (3 type)
  // 1 bomb --- 1 shuffle hands --- 6 invert
}

//création d'un tableau pour les vies et la main pour chaque joueur
function initHandsAndLives() {
  for (let x = 0; x < playerCount; x++) {
    playerHands.push([]);
    playerLives.push(5);
  }
}

function newRound() {
  console.log("\nNous débutons un nouveau round");
  emptyAllHands();
  pile = [];
  deck = [];
  initDeck();
  shuffleDeck();
  eachPlayerDrawCards(10);
}

//Mélanger le deck
function shuffleDeck() {
  deck.sort(function () {
    return 0.5 - Math.random();
  });
}

//Piocher une carte
function drawCard(playerIndex) {
  const cardDrawn = deck.shift();
  playerHands[playerIndex].push(cardDrawn);
}

//jouer une carte
function playCard(cardPlayedIndex) {
  let cardPlayed = playerHands[currentPlayer].splice(cardPlayedIndex, 1)[0];
  if (cardPlayed == "= 0" || cardPlayed == "= 10" || cardPlayed == "= 21") {
    transferPileToDeck();
  }
  pile.push(cardPlayed);
}

//calcul du total de la pile
function computePile() {
  total = 0;
  for (let pileIndex = 0; pileIndex < pile.length; pileIndex++) {
    // let cardValue = {
    //   joker: 0,
    //   pass: 0
    // }[pile[pileIndex]] || pile[pileIndex];

    let cardValue = pile[pileIndex];
    if (
      pile[pileIndex] == "shuffle hands" ||
      pile[pileIndex] == "invert" ||
      pile[pileIndex] == "bomb" ||
      pile[pileIndex] == "pass" ||
      pile[pileIndex] == "skip" ||
      pile[pileIndex] == "= 0" ||
      pile[pileIndex] == "+ 1" ||
      pile[pileIndex] == "+ 2"
    ) {
      cardValue = 0;
    }
    if (pile[pileIndex] == "= 10") {
      cardValue = 10;
    }
    if (pile[pileIndex] == "= 21") {
      cardValue = 21;
    }
    total = total + cardValue;
  }
  return total;
}

//tour du joueur suivant
function nextTurn() {
  currentPlayer++;
  if (currentPlayer > playerCount - 1) {
    currentPlayer = 0;
  }
}

//joueur courant peut il jouer ?
function canPlay(totalPile, playerHand) {
  let allowedToPlay = false;
  for (
    let playerHandIndex = 0;
    playerHandIndex < playerHand.length;
    playerHandIndex++
  ) {
    let cardValue = playerHand[playerHandIndex];
    if (
      playerHand[playerHandIndex] == "shuffle hands" ||
      playerHand[playerHandIndex] == "bomb" ||
      playerHand[playerHandIndex] == "invert" ||
      playerHand[playerHandIndex] == "pass" ||
      playerHand[playerHandIndex] == "skip" ||
      playerHand[playerHandIndex] == "= 0" ||
      playerHand[playerHandIndex] == "= 10" ||
      playerHand[playerHandIndex] == "= 21" ||
      playerHand[playerHandIndex] == "+ 1" ||
      playerHand[playerHandIndex] == "+ 2"
    ) {
      cardValue = 0;
    }
    if (cardValue + totalPile <= 21) {
      allowedToPlay = true;
    }
  }
  return allowedToPlay;
}

//le joueur courrant n'a plus de cartes en main
function noCardInHand() {
  return playerHands[currentPlayer].length == 0;
}

//tous les joueurs (sauf le joueur courant) perdent une vie
function decreaseOpponentsLives() {
  // players.forEach(function (el, index) {
  //   if (playerIndex == currentPlayer) return;
  //   playerLives[index]--;
  // })
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    if (playerIndex == currentPlayer) continue;
    playerLives[playerIndex]--;
  }

  // code suivant
}

//vide la pile et l'ajoute au deck
function transferPileToDeck() {
  deck = deck.concat(pile);
  pile = [];
}
//vérifie si la partie est finie
function isGameOver() {
  let gameIsOver = false;
  for (
    let playerLivesIndex = 0;
    playerLivesIndex < playerLives.length;
    playerLivesIndex++
  ) {
    let currentLives = playerLives[playerLivesIndex];
    if (currentLives == 0) {
      gameIsOver = true;
      console.log("le joueur " + (playerLivesIndex + 1) + " a perdu !");
    }
  }
  return gameIsOver;
}

function emptyAllHands() {
  playerHands = [];
  for (let x = 0; x < playerCount; x++) {
    playerHands.push([]);
  }
}

function eachPlayerDrawCards(count) {
  if (count == 1 || count == 2) {
    console.log(
      "Chaque joueur pioche " +
        count +
        " carte" +
        (count == 2 ? "s" : "") +
        " !"
    );
  }
  for (let x = 0; x < count; x++) {
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      drawCard(playerIndex);
    }
  }
}
// console.log({ deck });
// console.log({ playerHands });
