let gameState = [];
let currentLanguage = "pt"; // Defina o idioma padrão como português
let isGameStarted = false; // Defina esta variável como false inicialmente

// Função para obter o texto localizado com base no idioma atual
function getLocalizedText(ptText, enText) {
    const language = currentLanguage === "pt" ? "pt" : "en";
    return language === "pt" ? ptText : enText;
  }
  
// Defina o objeto com as informações do jogo
const gameData = {
  scenarios: {
    start: {
      story: getLocalizedText("<b>Você</b> está em uma floresta sombria. Você quer seguir para a esquerda ou para a direita?", "You are in a dark forest. Do you want to go left or right?"),
      choices: [
        { text: getLocalizedText("Esquerda", "Left"), next: "left" },
        { text: getLocalizedText("Direita", "Right"), next: "right" }
      ]
    },
    left: {
      story: getLocalizedText(`Você encontra uma cabana abandonada, ${gameState.playerName}.`, `You come across an abandoned cabin, ${gameState.playerName}.`),
      choices: [
        { text: getLocalizedText(`Investigar a cabana, ${gameState.playerName}.`, `Investigate the cabin, ${gameState.playerName}.`), next: "investigate" },
        { text: getLocalizedText(`Continuar a explorar a floresta, ${gameState.playerName}.`, `Continue exploring the forest, ${gameState.playerName}.`), next: "continue" },
        { text: getLocalizedText(`Investigar a cabana, ${gameState.playerName}.`, `Investigate the cabin, ${gameState.playerName}.`), next: "investigate" },
      ]
    },
    right: {
      story: getLocalizedText(`Você encontra um rio e uma ponte quebrada, ${gameState.playerName}.`, `You encounter a river and a broken bridge, ${gameState.playerName}.`),
      choices: [
        { text: getLocalizedText(`Tentar atravessar nadando, ${gameState.playerName}.`, `Try to swim across, ${gameState.playerName}.`), next: "swim" },
        { text: getLocalizedText(`Procurar outra rota, ${gameState.playerName}.`, `Look for another route, ${gameState.playerName}.`), next: "findAnotherRoute" }
      ]
    },
    // Adicione mais cenários e caminhos conforme necessário
  },
  currentScenario: "start" // Cenário inicial
};

function startNewGame() {
  isGameStarted = true;
  gameState = {
    playerName: getPlayerName(),
    currentChoice: 0
  };
  
  loadScenario(gameData.currentScenario);
  updateUI();
  document.getElementById("start-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

function continueGame() {
  isGameStarted = true;
  const savedGameState = JSON.parse(localStorage.getItem("textAdventureGameState"));
  if (savedGameState) {
    gameState = savedGameState;
  } else {
    gameState = {
      story: getLocalizedText("Você não tem um jogo salvo. Iniciando novo jogo...", "You don't have a saved game. Starting a new game..."),
      choices: [
        { text: getLocalizedText("Continuar", "Continue"), next: "startNew" },
        { text: getLocalizedText("Iniciar Novo Jogo", "Start New Game"), next: "startNew" }
      ]
    };
  }
  loadScenario(gameData.currentScenario);
  updateUI();
  document.getElementById("start-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

function makeChoice(choiceNumber) {
  const choice = gameState.choices[choiceNumber - 1];
  gameState.currentChoice = choiceNumber;
  gameState.currentScenario = choice.next;
  loadScenario(choice.next);
  localStorage.setItem("textAdventureGameState", JSON.stringify(gameState));
  updateUI();
  const selectedChoiceDiv = document.getElementById("selectedChoice");
  selectedChoiceDiv.innerText = getLocalizedText('"' + choice.text + '"', '"' + choice.text + '"');
}

function loadScenario(scenarioKey) {
  const currentScenario = gameData.scenarios[scenarioKey];
  gameState.story = getLocalizedText(currentScenario.story, currentScenario.story);
  gameState.choices = currentScenario.choices.map(choice => ({
    text: getLocalizedText(choice.text, choice.text),
    next: choice.next
  }));
}

function updateUI() {
  const storyElement = document.getElementById("story");
  const selectedChoiceDiv = document.getElementById("selectedChoice");

  // Limpa o conteúdo anterior antes de digitar o novo texto
  storyElement.innerHTML = "";
  selectedChoiceDiv.innerText = "";

  // Oculta os botões antes de exibir o texto com efeito de digitação
  const choicesContainer = document.getElementById("choices");
  choicesContainer.innerHTML = ""; // Limpa o conteúdo anterior dos botões de escolha

  // Exibe a história com efeito de digitação
  typeText(storyElement, gameState.story, 30);

  // Espera até que a história tenha sido completamente exibida antes de mostrar as escolhas
  setTimeout(() => {
    // Exibe as escolhas com efeito de digitação
    gameState.choices.forEach((choice, index) => {
      const choiceBtn = document.createElement("button");
      choiceBtn.id = "choice" + (index + 1);
      choiceBtn.onclick = () => makeChoice(index + 1);
      choiceBtn.style.display = "none";
      choiceBtn.innerText = choice.text;
      choicesContainer.appendChild(choiceBtn);
    });

    // Mostra os botões de escolha
    const choiceBtns = choicesContainer.querySelectorAll("button");
    choiceBtns.forEach((btn) => (btn.style.display = "block"));
  }, gameState.story.length * 30); // Aguarda o tempo necessário para digitar todo o texto da história

  // Remove a classe "selected-choice" dos botões antes de atualizar
  const choiceBtns = choicesContainer.querySelectorAll("button");
  choiceBtns.forEach((btn) => btn.classList.remove("selected-choice"));

  // Verifica qual escolha está selecionada e exibe na div de escolha selecionada
  if (gameState.currentChoice !== 0) {
    const selectedChoiceBtn = document.getElementById("choice" + gameState.currentChoice);
    if (selectedChoiceBtn) {
      selectedChoiceDiv.innerText = selectedChoiceBtn.innerText;
      selectedChoiceBtn.classList.add("selected-choice");
    }
  } else {
    selectedChoiceDiv.innerText = ""; // Caso nenhuma escolha seja selecionada, a div fica vazia
  }

  // Atualiza o texto do botão "Mudar Idioma" para refletir o idioma atual
  document.getElementById("languageBtn").innerText = getLocalizedText("Mudar Idioma", "Change Language");
}

function toggleLanguage() {
  // Verifica se o jogo já começou
  if (isGameStarted) {
    // Se o jogo já começou, avisa o usuário e não altera o idioma
    alert(getLocalizedText("Você não pode mudar o idioma depois de começar o jogo.", "You cannot change the language after the game has started."));
  } else {
    // Alterna entre os idiomas 'pt' (português) e 'en' (inglês)
    currentLanguage = currentLanguage === "pt" ? "en" : "pt";

    // Salva o idioma selecionado no armazenamento local
    localStorage.setItem("textAdventureLanguage", currentLanguage);

    // Atualiza o texto do jogo com o novo idioma selecionado
    loadScenario(gameState.currentScenario); // Recarrega o cenário atual para atualizar o texto com o idioma selecionado
    updateUI(); // Atualiza a interface para exibir o texto no idioma selecionado
  }
}

// Função para alternar entre o modo claro e o modo escuro
function toggleDarkMode() {
  const body = document.body;
  body.classList.toggle("dark-mode");

  // Salvar a preferência do usuário no armazenamento local
  const isDarkMode = body.classList.contains("dark-mode");
  localStorage.setItem("textAdventureDarkMode", isDarkMode);
}

// Verifica a preferência do usuário no carregamento da página
document.addEventListener("DOMContentLoaded", function () {
  const isDarkMode = localStorage.getItem("textAdventureDarkMode") === "true";
  const body = document.body;
  body.classList.toggle("dark-mode", isDarkMode);

  // Verifica se há um idioma salvo no armazenamento local
  const savedLanguage = localStorage.getItem("textAdventureLanguage");
  if (savedLanguage) {
    currentLanguage = savedLanguage;
  } else {
    // Se não houver, tenta obter o idioma do navegador
    const userLanguage = navigator.language.toLowerCase();
    if (userLanguage.startsWith("pt")) {
      currentLanguage = "pt";
    } else {
      currentLanguage = "en";
    }
  }

  updateUI(); // Atualiza a interface para exibir o texto no idioma selecionado
});


function getPlayerName() {
  const name = prompt(getLocalizedText("Digite seu nome:", "Enter your name:"));
  return name || "Yaami"; // Se o jogador não digitar um nome, use "Yaami" como padrão
}

// ${gameState.playerName}

function typeText(element, text, interval) {
  let index = 0;
  const tempElement = document.createElement("span");
  element.innerHTML = ""; // Limpa o conteúdo anterior antes de digitar o novo texto

  function type() {
    const char = text.charAt(index);

    if (char === "<") {
      // Se encontrar uma tag HTML, avança até encontrar o fechamento da tag ">"
      let closingTagIndex = text.indexOf(">", index);
      if (closingTagIndex !== -1) {
        closingTagIndex++; // Avança para o próximo caractere após ">"
        tempElement.innerHTML = text.substring(0, closingTagIndex);
        element.innerHTML = tempElement.innerHTML;
        index = closingTagIndex;
      }
    } else {
      // Se não for uma tag HTML, exibe a letra normalmente
      tempElement.innerHTML = text.substring(0, index + 1);
      element.innerHTML = tempElement.innerHTML;
      index++;
    }

    if (index < text.length) {
      setTimeout(type, interval);
    }
  }

  type();
}
