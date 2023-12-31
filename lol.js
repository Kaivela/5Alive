// *Tasks TO DO
//

// *DONE
//-check comment se comporte la bomb actuellement dans le cas extreme où on jouerait la bombe en derniere carte :
// Qui fait bien son effet normalement (c'est check)
//-preventCantDraw by resetting pile before draw
// on met donc la pile dans le deck en se rappelant du total de la pile pour ajouter des cartes a piocher, si plus de pile a mettre dans leck alors pas de pioche

// *NEW
// function remindLives (bout de code était répété 3 fois et j'ai sorti la fonction qui peut d'ailleurs s'avérer utile par la suite)
// global value : savedTotal
// function remindPile (pour prévenir le fait de piocher undifined)
// function ResetPile (il fallait update le transferPileToDeck en resetant également le savedTotal)

import Enquirer from "enquirer";

//déclaration de variables globaless
let deck = [];
let pile = [];
let pack = [];
let currentPlayer = 0;
let playerHands = [];
let playerLives = [];
let playerCount = 0;
let totalPile = 0;
let total = 0;
let reverseOrder = false;
let savedTotal = 0;

//---------------------------------------------

await askPlayerCount();
initDeck();
initHandsAndLives();
newRound();
//Tour du joueur courant
while (!isGameOver()) {
  console.log("\n--------------" + "\nJOUEUR " + (currentPlayer + 1) + "\n");
  totalPile = computePile();
  const currentHand = playerHands[currentPlayer];

  //si ne peux pas jouer
  if (canPlay(totalPile, currentHand) == false) {
    // perd une vie -->
    playerLives[currentPlayer]--;
    console.log(
      "joueur " +
        (currentPlayer + 1) +
        " ne peux pas jouer et perd une vie !\nnombre de vie restant : " +
        playerLives[currentPlayer] +
        "\nle total de la pile revient à 0"
    );
    resetPile();
    console.log({ total: computePile() });
    nextTurn();
    continue; // redémarre la boucle au début
  }
  const { cardPlayedIndex, currentPlayedCard } = await selectCard();
  // const cardObject = await selectCard();
  // const currentPlayedCard = cardObject.currentPlayedCard;
  // const cardPlayedIndex = cardObject.cardPlayedIndex;

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

    //si carte joué == invert
    if (currentPlayedCard == "invert") {
      if (reverseOrder == false) {
        reverseOrder = true;
      } else {
        reverseOrder = false;
      }
      console.log({ reverseOrder });
    }

    //si carte joué == shuffle hands
    if (currentPlayedCard == "shuffle hands") {
      if (noCardInHand()) {
        console.log(
          "le joueur " +
            (currentPlayer + 1) +
            " n'a plus de cartes en main !" +
            "\nChaque autre joueur perd une vie!\n"
        );
        decreaseOpponentsLives();
        remindLives();
        newRound();
      } else {
        playShuffleHands();
      }
    }

    //si carte joué == bomb
    if (currentPlayedCard == "bomb") {
      playBomb();
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
      remindLives();
      newRound();
    }
    console.log({ total: computePile() });
    nextTurn();
  }
}
//---------------------------------------------

//demande combien de joueurs jouent
async function askPlayerCount() {
  const enquirer = new Enquirer();
  const response = await enquirer.prompt({
    type: "input",
    name: "joueurs",
    message: "combien de joueurs etes vous?",
  });
  playerCount = Number(response.joueurs);
}

//assignation des vies et main pour chaque joueur
function initHandsAndLives() {
  for (let x = 0; x < playerCount; x++) {
    playerHands.push([]);
    playerLives.push(5);
  }
}

//création des cartes + ajout au deck
function initDeck() {
  for (let deckIndex = 0; deckIndex < 77; deckIndex++) {
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
      // 8 cartes : Quatre
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
      // 3 cartes : Egal Zéro
      deck.push("= 0");
    } else if (deckIndex < 52) {
      // 2 cartes : Egal Dix
      deck.push("= 10");
    } else if (deckIndex < 57) {
      // 5 cartes : Egal Vingt-et-un
      deck.push("= 21");
    } else if (deckIndex < 59) {
      // 2 cartes : Chaque joueur pioche 1 carte
      deck.push("+ 1");
    } else if (deckIndex < 61) {
      // 2 cartes : Chaque joueur pioche 2 cartes
      deck.push("+ 2");
    } else if (deckIndex < 67) {
      // 6 cartes : Changer le sens de jeu
      deck.push("invert");
    } else if (deckIndex < 68) {
      // 1 carte : Réunir les cartes de tous les joueurs dans un pack et les redistribuer
      deck.push("shuffle hands");
    } else if (deckIndex < 69) {
      // 1 carte : Bombe
      deck.push("bomb");
    } else if (deckIndex < 73) {
      // 4 cartes : Passer son tour
      deck.push("pass");
    } else {
      // 4 cartes : Passer le tour du joueur suivant
      deck.push("skip");
    }
  }
}

//Nouveau Round
function newRound() {
  console.log("\nNous débutons un nouveau round");
  emptyAllHands();
  pile = [];
  deck = [];
  initDeck();
  shuffleDeck();
  eachPlayerDrawCards(10);
}

//vider la main de chaque joueur
function emptyAllHands() {
  playerHands = [];
  for (let x = 0; x < playerCount; x++) {
    playerHands.push([]);
  }
}

//Mélanger le deck
function shuffleDeck() {
  deck.sort(function () {
    return 0.5 - Math.random();
  });
}

// chaque joueur pioche X carte(s)
function eachPlayerDrawCards(count) {
  if (count == 1 || count == 2) {
    console.log(
      "Chaque joueur pioche " +
        count +
        " carte" +
        (count >= 2 ? "s" : "") +
        " !"
    );
  }
  for (let x = 0; x < count; x++) {
    for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
      drawCard(playerIndex);
    }
  }
}

//Piocher une carte
function drawCard(playerIndex) {
  if (deck.length == 0) {
    remindPile();
    shuffleDeck();
  }
  if (deck.length == 0) {
    console.log("y a plus de cartes... dommage !");
    return;
  }
  const cardDrawn = deck.shift();
  playerHands[playerIndex].push(cardDrawn);
}

// selection d'une carte
async function selectCard() {
  const enquirer = new Enquirer();
  const currentHand = playerHands[currentPlayer];
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
  return { currentPlayedCard, cardPlayedIndex };
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

//jouer une carte
function playCard(cardPlayedIndex) {
  let cardPlayed = playerHands[currentPlayer].splice(cardPlayedIndex, 1)[0];
  if (cardPlayed == "= 0" || cardPlayed == "= 10" || cardPlayed == "= 21") {
    resetPile();
  }
  pile.push(cardPlayed);
}

//calcul du total de la pile
function computePile() {
  total = 0;
  for (let pileIndex = 0; pileIndex < pile.length; pileIndex++) {
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
  return total + savedTotal;
}

//tour du joueur suivant
function nextTurn() {
  if (reverseOrder) {
    currentPlayer--;
    if (currentPlayer < 0) {
      currentPlayer = playerCount - 1;
    }
  } else {
    currentPlayer++;
    if (currentPlayer > playerCount - 1) {
      currentPlayer = 0;
    }
  }
}

//le joueur courrant n'a plus de cartes en main
function noCardInHand() {
  return playerHands[currentPlayer].length == 0;
}

//tous les joueurs (sauf le joueur courant) perdent une vie
function decreaseOpponentsLives() {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    if (playerIndex == currentPlayer) continue;
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

//mettre les cartes dans un pack
function transferHandsToPack() {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    console.log(
      "le joueur " + (playerIndex + 1) + " met ses cartes dans le pack"
    );
    pack = pack.concat(playerHands[playerIndex]);
    playerHands[playerIndex] = [];
  }
}

//Mélanger le pack
function shufflePack() {
  pack.sort(function () {
    return 0.5 - Math.random();
  });
}

//distribuer le pack en commencant par la gauche
function dealPack() {
  let playerIndex = currentPlayer;
  while (pack.length > 0) {
    playerIndex++;
    if (playerIndex > playerCount - 1) {
      playerIndex = 0;
    }
    const cardDrawn = pack.shift();
    playerHands[playerIndex].push(cardDrawn);
  }
}

//joue la carte shuffleHands
function playShuffleHands() {
  transferHandsToPack();
  shufflePack();
  console.log(
    "le joueur " +
      (currentPlayer + 1) +
      " mélange puis distribue le pack en commencant par le joueur à sa gauche"
  );
  dealPack();
  console.log("le total est remis à 0");
  resetPile();
}

//joue la carte bombe
function playBomb() {
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    const currentHand = playerHands[playerIndex];
    if (playerIndex == currentPlayer) continue;
    console.log({ Player: playerIndex + 1 });
    //si possède une carte 0 alors l'envoie vers la pile
    if (haveZero(currentHand)) {
      console.log(
        "le joueur " + (playerIndex + 1) + " se déffausser d'une carte 0"
      );
      // trouver l'index du premier 0 qu'il y a dans sa main
      const cardIndex = currentHand.findIndex(function isZero(card) {
        return card == 0;
      });
      // index trouvé --> dégager la carte de sa main avec splice
      playerHands[playerIndex].splice(cardIndex, 1);
      // push un 0 dans la pile
      pile.push(0);
    }
    // sinon perd une vie
    else {
      console.log(
        "le joueur " +
          (playerIndex + 1) +
          " ne peut se déffausser d'une carte 0\nIl perd donc une vie !"
      );
      playerLives[playerIndex]--;
    }
  }
  remindLives();
  console.log("le total est remis à 0");
  resetPile();
}

// parcours la main pour vérifier si celle ci contient une carte 0
function haveZero(playerHand) {
  let haveZeroInHand = false;
  for (let cardIndex = 0; cardIndex < playerHand.length; cardIndex++) {
    let cardValue = playerHand[cardIndex];
    if (cardValue == 0) {
      haveZeroInHand = true;
    }
  }
  console.log({ haveZeroInHand });
  return haveZeroInHand;
}

// rappel du nombre de vie
function remindLives() {
  console.log("***Rappel :");
  for (let playerIndex = 0; playerIndex < playerCount; playerIndex++) {
    console.log(
      "Nombre de vie du joueur " +
        (playerIndex + 1) +
        ": " +
        playerLives[playerIndex]
    );
  }
}

//save current totalPile + transfer pile to deck
function remindPile() {
  savedTotal = computePile();
  transferPileToDeck();
}

//reset la pile et le saved total
function resetPile() {
  transferPileToDeck();
  savedTotal = 0;
}
