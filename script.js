let deckIdObj = {};
let playerHand = [];
let aiHand = [];
let aiPoints = 0;
let playerPoints = 0;
let balance = 100;
let bet = 0;
async function getDeckId() {
  const response = await fetch(
    'https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=2'
  );

  const myJson = await response.json();
  return myJson;
}

async function drawTwo(deckId) {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=2`
  );
  const json = await response.json();
  return json.cards;
}

async function drawOne(deckId) {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckId}/draw/?count=1`
  );
  const json = await response.json();

  return json.cards;
}

function renderPlayerDeck(hand) {
  let aces = 0;
  const divPlayer = document.querySelector('.player');
  const totalPlayer = document.querySelector('.player-total');
  divPlayer.innerHTML = '';
  playerPoints = 0;
  hand.forEach((card) => {
    divPlayer.innerHTML += `<img src="${card.image}" width="150px"></img>`;

    if (
      card.value === 'KING' ||
      card.value === 'JACK' ||
      card.value === 'QUEEN'
    ) {
      playerPoints += 10;
    } else if (card.value === 'ACE') {
      // Ace value can be 1 or 11
      playerPoints += 11;
      aces += 1;
      // If 11 is too much, subtract 10
      if (playerPoints > 21) {
        playerPoints -= 10;
        aces -= 1;
      }
    } else {
      playerPoints += +card.value;
    }
    totalPlayer.innerHTML = `Total: ${playerPoints}`;
  });
  // If points are over 21, subtract all aces by 10
  if (playerPoints > 21) {
    playerPoints -= aces * 10;
    totalPlayer.innerHTML = `Total: ${playerPoints}`;
  }
}

function renderAiDeck(hand) {
  const divAi = document.querySelector('.ai');
  const totalAi = document.querySelector('.ai-total');
  divAi.innerHTML = '';
  aiPoints = 0;
  hand.forEach((card) => {
    divAi.innerHTML += `<img src="${card.image}" width="150px"></img>`;

    if (
      card.value === 'KING' ||
      card.value === 'JACK' ||
      card.value === 'QUEEN'
    )
      aiPoints += 10;
    else if (card.value === 'ACE') {
      // Ace value can be 1 or 11
      aiPoints += 11;
      // If 11 is too much, subtract 10
      if (aiPoints > 21) {
        aiPoints -= 10;
      }
    } else aiPoints += +card.value;
    totalAi.innerHTML = `Total: ${aiPoints}`;
  });
}

function showButtons() {
  document.querySelector('.stay').hidden = false;
  document.querySelector('.hit').hidden = false;
}
function hideButtons() {
  document.querySelector('.stay').hidden = true;
  document.querySelector('.hit').hidden = true;
}
function restartGame() {
  aiHand = [];
  playerHand = [];
  aiPoints = 0;
  playerPoints = 0;
  document.querySelector('.restart').hidden = true;
  document.querySelector('.stay').removeEventListener('click', stay);
  document.querySelector('.hit').removeEventListener('click', hit);
  document.querySelector('.restart').removeEventListener('click', restartGame);
  document.querySelector('.result').innerHTML = '';
  makeBet();
}

function endGame() {
  const resultParagraph = document.querySelector('.result');
  //
  if (playerPoints > 21) resultParagraph.innerHTML = 'AI won';
  else if (aiPoints > 21) {
    resultParagraph.innerHTML = 'Player won';
    balance += bet * 2;
  } else if (playerPoints > aiPoints) {
    resultParagraph.innerHTML = 'Player won';
    balance += bet * 2;
  } else if (aiPoints > playerPoints) resultParagraph.innerHTML = 'AI won';
  else {
    resultParagraph.innerHTML = 'Draw';
    balance += bet;
  }

  document.querySelector('.restart').hidden = false;
  document.querySelector('.restart').addEventListener('click', restartGame);
}

async function hit() {
  console.log('hit');
  hideButtons();
  const newCard = await drawOne(deckIdObj.deck_id);
  playerHand = [...playerHand, ...newCard];
  console.log(playerHand);
  renderPlayerDeck(playerHand);
  console.log('player points', playerPoints);
  console.log('ai points', aiPoints);
  if (playerPoints > 21) {
    endGame();
  } else showButtons();
}

async function stay() {
  console.log('stay');
  hideButtons();
  while (aiPoints < 17) {
    const newCard = await drawOne(deckIdObj.deck_id);
    aiHand = [...aiHand, ...newCard];
    console.log(aiHand);
    renderAiDeck(aiHand);
    console.log('player points', playerPoints);
    console.log('ai points', aiPoints);
  }
  endGame();
}

async function setup() {
  deckIdObj = await getDeckId();
  makeBet();
}

function makeBet() {
  bet = Number(prompt(`Make a bet (balance: ${balance})`));
  balance -= bet;
  main();
}

async function main() {
  console.log(deckIdObj);
  playerHand = await drawTwo(deckIdObj.deck_id);
  console.log(playerHand);
  aiHand = await drawOne(deckIdObj.deck_id);
  console.log(aiHand);

  renderAiDeck(aiHand);
  renderPlayerDeck(playerHand);
  showButtons();

  document.querySelector('.hit').addEventListener('click', hit);

  document.querySelector('.stay').addEventListener('click', stay);
}

setup();
