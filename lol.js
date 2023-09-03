import Enquirer from "enquirer";

//déclaration de variables globaless
let deck = [];
let pile = [];
let currentPlayer = 0;
let playerHands = [];
let playerLives = [];

const enquirer = new Enquirer();
const response = await enquirer.prompt({
  type: "input",
  name: "joueurs",
  message: "combien de joueurs etes vous?",
});
let playerCount = response.joueurs;

//selection d'une carte valide

//---------------------------------------------
initDeck();
initHandsAndLives();
newRound();
//Tour du joueur courant
while (!isGameOver()) {
  console.log("--------------");
  console.log("JOUEUR " + (currentPlayer + 1));
  console.log("--------------");
  const totalPile = computePile();
  const currentHand = playerHands[currentPlayer];
  // console.log({ currentHand });

  //si ne peux pas jouer
  if (canPlay(totalPile, currentHand) == false) {
    // perd une vie -->
    playerLives[currentPlayer]--;
    console.log(
      "joueur " +
        (currentPlayer + 1) +
        " perd une vie !" +
        "\nle total de la pile revient à 0"
    );
    // console.log({ playerLives });
    transferPileToDeck();
    console.log({ total: computePile() });
    nextTurn();
    continue;
  }

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

  //joue la carte et passe au tour/round suivant
  if (currentPlayedCard + totalPile > 5) {
    console.log("can't play this card !! Select another :");
  } else {
    playCard(cardPlayedIndex);
    // console.log({ cardPlayedIndex });
    if (noCardInHand()) {
      decreaseOpponentsLives();
      console.log({ playerLives });
      newRound();
      console.log("nouveau round !");
    }
    console.log({ pile });
    console.log({ total: computePile() });
    nextTurn();
  }
}
//---------------------------------------------

//demande combien de joueurs jouent + création d'un tableau pour les vies et la main pour chaque joueur
function initHandsAndLives() {
  for (let x = 0; x < playerCount; x++) {
    playerHands.push([]);
    playerLives.push(3);
  }
  // console.log({ playerLives });
}
//création des cartes + ajout au deck
function initDeck() {
  for (let deckIndex = 0; deckIndex < 50; deckIndex++) {
    if (deckIndex < 5) {
      deck.push("pass");
    } else if (deckIndex < 10) {
      deck.push(0);
    } else if (deckIndex < 30) {
      deck.push(1);
    } else {
      deck.push(2);
    }
  }
}

//mélanger le deck
function shuffleDeck() {
  deck.sort(function () {
    return 0.5 - Math.random();
  });
}

//piocher une carte
function drawCard(playerIndex) {
  const cardDrawn = deck.shift();
  // console.log({ playerHands, playerIndex });
  playerHands[playerIndex].push(cardDrawn);
}

//nouveau round
/* ?? vide la main de chaque joueur
 ** la pile
 ** réinintialise le deck
 ** mélange le deck
 ** distribue 10 cartes a chaque joueur
 */
function newRound() {
  playerHands = [];
  for (let x = 0; x < playerCount; x++) {
    playerHands.push([]);
  }
  pile = [];
  initDeck();
  shuffleDeck();
  for (let x = 0; x < 10; x++) {
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      drawCard(playerIndex);
    }
  }
}

//jouer une carte
function playCard(cardPlayedIndex) {
  let cardPlayed = playerHands[currentPlayer].splice(cardPlayedIndex, 1)[0];
  pile.push(cardPlayed);
}

//calcul du total de la pile
function computePile() {
  let total = 0;
  for (let pileIndex = 0; pileIndex < pile.length; pileIndex++) {
    // let cardValue = {
    //   joker: 0,
    //   pass: 0
    // }[pile[pileIndex]] || pile[pileIndex];

    let cardValue = pile[pileIndex];
    if (pile[pileIndex] == "joker" || pile[pileIndex] == "pass") {
      cardValue = 0;
    }
    // if (pile[pileIndex] == "=10") total = 10
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
      playerHand[playerHandIndex] == "joker" ||
      playerHand[playerHandIndex] == "pass"
    ) {
      cardValue = 0;
    }
    if (cardValue + totalPile <= 5) {
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
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    if (playerIndex == currentPlayer) return;
    console.log(
      "la main du joueur " +
        (currentPlayer + 1) +
        " est vide! les autres joueurs perdent une vie !" +
        "\nun nouveau Round démarre !"
    );
    // console.log({ currentPlayer: currentPlayer + 1 });
    playerLives[playerIndex]--;
  }
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

// console.log({ deck });
// console.log({ playerHands });
