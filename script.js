let gameState = null;
let currentLanguage = "pt"; // Defina o idioma padrão como português
let isGameStarted = false; // Defina esta variável como false inicialmente

async function startNewGame() {
  isGameStarted = true;

  try {
    // Carrega as escolhas iniciais do arquivo escolhas.json
    const choicesData = await fetchChoices();
    const startChoices = choicesData.start.choices;

    // Define o estado inicial do jogo com as escolhas iniciais e a história
    gameState = {
      playerName: getPlayerName(),
      story: getLocalizedText(choicesData.start.story.pt, choicesData.start.story.en),
      choices: startChoices,
      currentChoice: 0
    };

    updateUI();
    document.getElementById("start-container").style.display = "none";
    document.getElementById("game-container").style.display = "block";
  } catch (error) {
    console.error('Erro ao carregar as escolhas iniciais:', error);
  }
}


function continueGame() {
  isGameStarted = true;
  // Recupera o estado do jogo do armazenamento local, se disponível, caso contrário, inicia um novo jogo
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
  updateUI();
  document.getElementById("start-container").style.display = "none";
  document.getElementById("game-container").style.display = "block";
}

// Função para fazer o fetch do arquivo JSON
async function fetchChoices() {
  const response = await fetch('escolhas.json');
  const jsonData = await response.json();
  return jsonData;
}

function makeChoice(choiceNumber) {
  const choice = gameState.choices[choiceNumber - 1];

  // Armazena a escolha selecionada no estado do jogo
  gameState.currentChoice = choiceNumber;

  // Obtém a próxima etapa com base na escolha feita pelo jogador
  const nextStep = choice.next;


  // Carrega as novas escolhas e a história da próxima etapa do arquivo JSON
  fetchChoices()
    .then((choicesData) => {
      const nextStepData = choicesData[nextStep];
      if (nextStepData) {
        gameState.choices = nextStepData.choices;
        gameState.story = getLocalizedText(nextStepData.story.pt, nextStepData.story.en);

        // Salva o estado do jogo no armazenamento local
        localStorage.setItem("textAdventureGameState", JSON.stringify(gameState));
      } else {
        console.error(`Erro: próxima etapa '${nextStep}' não encontrada no arquivo escolhas.json.`);
      }

      // Atualiza a interface do usuário após a escolha do jogador
      updateUI();
    })
    .catch((error) => {
      console.error('Erro ao carregar escolhas.json:', error);
    });
}

function updateUI() {
  const storyElement = document.getElementById("story");
  const selectedChoiceDiv = document.getElementById("selectedChoice");
  const choicesContainer = document.getElementById("choices");

  // Substitui a tag {{playerName}} pelo nome do jogador na história
  gameState.story = gameState.story.replace(/{{playerName}}/g, gameState.playerName);

  // Substitui a tag {{playerName}} nas opções de escolha
  gameState.choices.forEach((choice) => {
    choice.text = {
      pt: choice.text.pt.replace(/{{playerName}}/g, gameState.playerName),
      en: choice.text.en.replace(/{{playerName}}/g, gameState.playerName),
    };
  });

  // Exibe a história com o conteúdo HTML renderizado
  storyElement.innerHTML = gameState.story;

  // Verifica qual escolha está selecionada
  const selectedChoiceBtn = document.getElementById("choice" + gameState.currentChoice);
  if (selectedChoiceBtn) {
    const choiceText = selectedChoiceBtn.innerText;
    if (choiceText.trim() === "▶") {
      // Se a opção selecionada tiver o texto "▶", não exibiremos nada na div
      selectedChoiceDiv.innerText = "";
    } else {
      selectedChoiceBtn.classList.add("selected-choice");
      selectedChoiceDiv.innerText = `"` + choiceText + `"`;
    }
  } else {
    selectedChoiceDiv.innerText = ""; // Caso nenhuma escolha seja selecionada, a div fica vazia
  }

  // Limpa o conteúdo anterior dos botões de escolha
  choicesContainer.innerHTML = "";

  // Exibe as escolhas imediatamente após o texto da história
  gameState.choices.forEach((choice, index) => {
    const choiceBtn = document.createElement("button");
    choiceBtn.id = "choice" + (index + 1);
    choiceBtn.onclick = () => makeChoice(index + 1);
    choiceBtn.innerText = getLocalizedText(choice.text.pt, choice.text.en); // Mostra o texto da opção no idioma selecionado
    choicesContainer.appendChild(choiceBtn);
  });

  // Adiciona a classe "selected-choice" ao botão selecionado (caso exista)
  const selectedChoiceBtnNew = document.getElementById("choice" + gameState.currentChoice);
  if (selectedChoiceBtnNew) {
    selectedChoiceBtnNew.classList.add("selected-choice");
  }
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

    // Atualiza o texto do botão "Mudar Idioma" para refletir o idioma atual
    document.getElementById("languageBtn").innerText = getLocalizedText("PT", "EN");

    // Atualiza o texto do jogo com o novo idioma selecionado
    gameState.story = getLocalizedText(gameState.story, gameState.story);

    // Atualiza a interface do usuário
    updateUI();
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

// Função para obter o texto localizado com base no idioma atual
function getLocalizedText(ptText, enText) {
  return currentLanguage === "pt" ? ptText : enText;
}

function getPlayerName() {
  const name = prompt(getLocalizedText("Digite seu nome:", "Enter your name:"));
  return name || "Yaami"; // Se o jogador não digitar um nome, use "Luni" como padrão
}

// ${gameState.playerName}

let typingTimeout;

function typeText(element, text) {
  let index = 0;
  const tempElement = document.createElement("span");
  element.innerHTML = ""; // Limpa o conteúdo anterior antes de digitar o novo texto

  while (index < text.length) {
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
  }
}



function toggleMenu() {
  var menuGroup = document.getElementById("menuGroup");
  if (menuGroup.style.display === "none") {
    menuGroup.style.display = "flex";
  } else {
    menuGroup.style.display = "none";
  }
}

