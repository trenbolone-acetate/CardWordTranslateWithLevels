  $("#checkButton").click(async function () {
    $("#translationInput").prop("disabled", true);
    checkAnswer();
    $("#translationInput").text = '';
  });

  const beginnerWords=["apple","banana","cat","dog","elephant","fish","grape","house","ice cream",
  "jacket","kite","lamp","moon","nest","orange","pencil","queen","rabbit","sun",
  "tree","umbrella","van","window","xylophone","yellow","zebra"];

  const intermediateWords=["ambiguous","benevolent","capitulate","deleterious","effervescent","facetious",
  "gregarious","haphazard","inquisitive","juxtapose","kaleidoscope","lament","magnanimous","nonchalant",
  "obfuscate","paradigm","quixotic","resilient","serendipity","ubiquitous","vexatious","whimsical",
  "xenophobia","yearn","zephyr","aberration"];

  const advancedWords=["aberrant","belligerent","cacophony","deleterious","efficacious","facetious","garrulous",
  "hedonistic","iconoclast","juxtaposition","kaleidoscopic","labyrinthine","mellifluous","nonplussed",
  "obfuscate","peregrinate","querulous","recalcitrant","salubrious","taciturn","ubiquitous",
  "vexatious","wraithlike","xenophobic","yeomanly","zealous"];

  var wordToTranslate = '';
  var wordTranslation = '';
  var selectedDifficulty = 'beginner';

  var maxWords = 10;
  var currentWord = 0;
  var correctCount = 0;
  var incorrectCount = 0;

function checkAnswer() {
  var userTranslation = $("#translationInput").val().trim().toLowerCase();  
  if (currentWord!==0) {
    if (userTranslation === wordTranslation.toLowerCase()) {
      correctCount++;
      $("#score").css('background-color', 'green');
      setTimeout(function() {
          $("#score").css('background-color', 'initial');
        }, 500);
    } else {
      incorrectCount++;
      $("#score").css('background-color', 'red');
      setTimeout(function() {
          $("#score").css('background-color', 'initial');
        }, 500);
    }
  
    if (currentWord === maxWords) {
      updateScore();
      showResultModal();
      $("button").disabled=true;
    } else {
      currentWord++;
      getWordInfo();
      updateScore();
      $("#translationInput").val('');
    }
  }
  else{
    $("#checkButton").text = 'Check';
    getWordInfo();
    currentWord++;
  }
}

function loadWords(difficulty) {
  switch (difficulty) {
    case 'beginner':
      return beginnerWords.map(word => word.charAt(0).toUpperCase() + word.slice(1));;
    case 'intermediate':
      return intermediateWords.map(word => word.charAt(0).toUpperCase() + word.slice(1));;
    case 'advanced':
      return advancedWords.map(word => word.charAt(0).toUpperCase() + word.slice(1));;
    default:
      break;
  }
}

$('input[name="difficulty"]').change(function() {
  selectedDifficulty = $('input[name="difficulty"]:checked').val();
 console.log(`Chosen difficulty: ${selectedDifficulty}`);
});

async function getWordInfo() {
  var selectedWords = loadWords(selectedDifficulty);
  var selectedWord = selectedWords[Math.floor(Math.random() * selectedWords.length)];
  $("#card h4").text(selectedWord);
  console.log(`Word: ${selectedWord}`);
  wordToTranslate = selectedWord;
  describeFetchedWord(selectedWord);
  await translateFetchedWord(selectedWord);
}

async function describeFetchedWord(word) {
  const url = `https://wordsapiv1.p.rapidapi.com/words/${word}/definitions`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '7ba5fcb28bmshf0bc269820defaap1c19b9jsn49823a4484be',
      'X-RapidAPI-Host': 'wordsapiv1.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const result = await response.json();

    if (result.definitions && result.definitions.length > 0) {
      const definition = result.definitions[0].definition;
      console.log(`${word}'s definition: ${definition}.`);
      $("#card p").text(definition);
      return definition;
    } else {
      console.log('No definition found.');
      $("#card p").text('No definition found.');
      return 'No definition found.';
    }
  } catch (error) {
    console.error(error);
    return 'Error fetching definition.';
  }
}

async function translateFetchedWord(word) {
  const options = {
    method: "POST",
    url: "https://api.edenai.run/v2/translation/automatic_translation",
    headers: {
      authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMjAxZGJjZmMtYjIzNS00MWM2LWEyZjUtNmI5Mjc5MjFhOGFjIiwidHlwZSI6ImFwaV90b2tlbiJ9.3ZeJD0L7iDNwh4REex0GofmEW-Ftmz-Lew9s6ViMJgw",
    },
    data: {
      show_original_response: false,
      fallback_providers: "",
      providers: "amazon,google,ibm,microsoft",
      text: word,
      source_language: "en",
      target_language: "uk",
    },
  };
  
  axios
  .request(options)
  .then((response) => {
    console.log(`Переклад: ${response.data.google ? response.data.google.text : response.data[0].text}` );
    wordTranslation = response.data.google ? response.data.google.text  : response.data[0].text ;
  $("#translationInput").prop("disabled", false);

  })
  .catch((error) => {
    console.error(error);
  });
}

document.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      $("#checkButton").click();
    }
});
function updateScore() {
  $("#progress").html(`Word <span id="currentStep">${currentWord}</span> of 10`);
  $("#correctCount").text(correctCount);
  $("#incorrectCount").text(incorrectCount);
}

function showResultModal() {
    $(":button").prop("disabled", true);
    $(":input").prop("disabled", true);
  $("#proficiencyLevel").text(`You've scored ${correctCount} out of 10!`);
  $("#resultModal").show();
}
$(".close").click(function () {
  $("#resultModal").hide();
});
    