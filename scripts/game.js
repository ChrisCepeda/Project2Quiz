// DECLARATIONS
const question = document.getElementById('question');
const choices = Array.from(document.getElementsByClassName('choice-text'));
const progressText = document.getElementById('progressText');
const scoreText = document.getElementById('score');
const progressBarFull = document.getElementById('progressBarFull');
const loader = document.getElementById('loader');
const game = document.getElementById('game');
const questionClass = Array.from(document.getElementsByClassName('choice-container'));

const CORRECT_BONUS = 10;
const MAX_QUESTIONS = 10;

let currentQuestion = {};
let acceptingAnswers = false;
let score = 0;
let questionCounter = 0;
let availableQuesions = [];
let questions = [];

// FETCH API
fetch("https://opentdb.com/api.php?amount=10&category=12&difficulty=medium&type=multiple")
    .then((res) => {return res.json();})
    .then((loadedQuestions) => {
        questions = loadedQuestions.results.map((loadedQuestion) => {
            const formattedQuestion = {
                question: loadedQuestion.question,
            };

            const answerChoices = [...loadedQuestion.incorrect_answers];
            formattedQuestion.answer = Math.floor(Math.random() * 4) + 1;
            
            answerChoices.splice(
                formattedQuestion.answer - 1,
                0,
                loadedQuestion.correct_answer
            );

            answerChoices.forEach((choice, index) => {
                formattedQuestion['choice' + (index + 1)] = choice;
            });

            return formattedQuestion;
        });
        // After loading and formatting questions, start game
        startGame();
    })
    .catch((err) => {
        console.error(err);
    });

// FADE IN ANIMATION
quizLoadAnim = () => {
     for (let i = 0; i < questionClass.length; i++) {
        questionClass[i].classList.add("fadeInAnim");
      }
};

quizLoadAnimRemove = () => {
    for (let i = 0; i < questionClass.length; i++) {
        questionClass[i].classList.remove("fadeInAnim");
      }
}

// GAME FUNCTIONS
startGame = () => {
    // Resets game variables
    questionCounter = 0;
    score = 0;
    availableQuesions = [...questions];
    getNewQuestion();
    // Hide loader AFTER loading in new question
    game.classList.remove("hidden");
    loader.classList.add("hidden");
};

getNewQuestion = () => {
    // Check if game is over, if over, set score in localStorage
    if (availableQuesions.length === 0 || questionCounter >= MAX_QUESTIONS) {
        localStorage.setItem('mostRecentScore', score);
        //Go to the end page
        return window.location.assign('/end.html');
    }

    quizLoadAnim();
    questionCounter++;
    progressText.innerText = `Question ${questionCounter}/${MAX_QUESTIONS}`;
    //Update the progress bar
    progressBarFull.style.width = `${(questionCounter / MAX_QUESTIONS) * 100}%`;
    // Grab and display a new question from the available questions array
    const questionIndex = Math.floor(Math.random() * availableQuesions.length);
    currentQuestion = availableQuesions[questionIndex];
    question.innerText = currentQuestion.question;
    // Grab and display choices for new question
    choices.forEach((choice) => {
        const number = choice.dataset['number'];
        choice.innerText = currentQuestion['choice' + number];
    });
    // Remove the "used" question from array of available questions
    availableQuesions.splice(questionIndex, 1);
    acceptingAnswers = true;
};

choices.forEach((choice) => {
    choice.addEventListener('click', (e) => {
        // If not accepting answers, do nothing on click
        if (!acceptingAnswers) return;

        // If accepting answers, set user input to answer number
        acceptingAnswers = false;
        const selectedChoice = e.target;
        const selectedAnswer = selectedChoice.dataset['number'];
        // Check if answer number is correct
        const classToApply =
            selectedAnswer == currentQuestion.answer ? 'correct' : 'incorrect';

        if (classToApply === 'correct') {
            incrementScore(CORRECT_BONUS);
        }
        selectedChoice.parentElement.classList.add(classToApply);
        quizLoadAnimRemove();
        // After choosing an answer, reset board and get new questions
        setTimeout(() => {
            selectedChoice.parentElement.classList.remove(classToApply);
            getNewQuestion();
        }, 1000);
    });
});

incrementScore = (num) => {
    // Updates live score in html
    score += num;
    scoreText.innerText = score;
};