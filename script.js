let gameState = null;

function startNewGame() {
  // Define the initial game state for a new game
  gameState = {
    story: "Você está em uma floresta sombria. Você quer seguir para a esquerda ou para a direita?",
    choices: [
      { text: "Esquerda", next: "left" },
      { text: "Direita", next: "right" }
    ]
  };
  updateUI();
  document.getElementById("start-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

function continueGame() {
  // Retrieve the game state from local storage if available, otherwise start a new game
  const savedGameState = JSON.parse(localStorage.getItem("textAdventureGameState"));
  if (savedGameState) {
    gameState = savedGameState;
  } else {
    gameState = {
      story: "Você não tem um jogo salvo. Iniciando novo jogo...",
      choices: [
        { text: "Continuar", next: "startNew" },
        { text: "Iniciar Novo Jogo", next: "startNew" }
      ]
    };
  }
  updateUI();
  document.getElementById("start-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

function makeChoice(choiceNumber) {
  const choice = gameState.choices[choiceNumber - 1];
  gameState.story = "Você escolheu ir para " + choice.text.toLowerCase() + ". ";

  // Here you can define different storylines based on the player's choices
  if (choice.next === "left") {
    gameState.story += "Você encontra uma cabana abandonada.";
    gameState.choices = [
      { text: "Investigar a cabana", next: "investigate" },
      { text: "Continuar a explorar a floresta", next: "continue" }
    ];
  } else if (choice.next === "right") {
    gameState.story += "Você encontra um rio e uma ponte quebrada.";
    gameState.choices = [
      { text: "Tentar atravessar nadando", next: "swim" },
      { text: "Procurar outra rota", next: "findAnotherRoute" }
    ];
  }

  // Save the game state to local storage
  localStorage.setItem("textAdventureGameState", JSON.stringify(gameState));

  updateUI();
}

function updateUI() {
  document.getElementById("story").innerText = gameState.story;

  const choice1Btn = document.getElementById("choice1");
  const choice2Btn = document.getElementById("choice2");

  choice1Btn.innerText = gameState.choices[0].text;
  choice2Btn.innerText = gameState.choices[1].text;
}


// Função para alternar entre o modo claro e o modo escuro
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  // Salvar a preferência do usuário no armazenamento local
  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("textAdventureDarkMode", isDarkMode);
}

// Verificar a preferência do usuário no carregamento da página
document.addEventListener("DOMContentLoaded", function () {
  const isDarkMode = localStorage.getItem("textAdventureDarkMode") === "true";
  const body = document.body;
  body.classList.toggle("dark-mode", isDarkMode);
});
