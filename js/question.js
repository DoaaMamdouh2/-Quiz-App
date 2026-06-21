
/**
 * ============================================
 * QUESTION CLASS
 * ============================================
 *
 * This class handles displaying and interacting with a single question.
 *
 * PROPERTIES TO CREATE:
 * - quiz (Quiz) - Reference to the Quiz instance
 * - container (HTMLElement) - DOM element to render into
 * - onQuizEnd (Function) - Callback when quiz ends
 * - questionData (object) - Current question from quiz.getCurrentQuestion()
 * - index (number) - Current question index
 * - question (string) - The decoded question text
 * - correctAnswer (string) - The decoded correct answer
 * - category (string) - The decoded category name
 * - wrongAnswers (array) - Decoded incorrect answers
 * - allAnswers (array) - Shuffled array of all answers
 * - answered (boolean) - Has user answered? Starts false
 * - timerInterval (number) - The setInterval ID
 * - timeRemaining (number) - Seconds left, starts at 15 seconds
 *
 * METHODS TO IMPLEMENT:
 * - constructor(quiz, container, onQuizEnd)
 * - decodeHtml(html) - Decode HTML entities like &amp;
 * - shuffleAnswers() - Shuffle answers randomly
 * - getProgress() - Calculate progress percentage
 * - displayQuestion() - Render the question HTML
 * - addEventListeners() - Add click handlers to answers
 * - removeEventListeners() - Cleanup handlers
 * - startTimer() - Start countdown
 * - stopTimer() - Stop countdown
 * - handleTimeUp() - When timer reaches 0
 * - checkAnswer(choiceElement) - Check if answer is correct
 * - highlightCorrectAnswer() - Show correct answer
 * - getNextQuestion() - Load next or show results
 * - animateQuestion(duration) - Transition to next
 *
 * HTML ENTITIES:
 * The API returns text with HTML entities like:
 * - &amp; should become &
 * - &quot; should become "
 * - &#039; should become '
 *
 * Use this trick to decode:
 * const doc = new DOMParser().parseFromString(html, 'text/html');
 * return doc.documentElement.textContent;
 *
 * SHUFFLE ALGORITHM (Fisher-Yates):
 * for (let i = array.length - 1; i > 0; i--) {
 *   const j = Math.floor(Math.random() * (i + 1));
 *   [array[i], array[j]] = [array[j], array[i]];
 * }
 */

export default class Question {
  // TODO: Create constructor(quiz, container, onQuizEnd)
  // 1. Store the three parameters
  // 2. Get question data: this.questionData = quiz.getCurrentQuestion()
  // 3. Store index: this.index = quiz.currentQuestionIndex
  // 4. Decode and store: question, correctAnswer, category
  // 5. Decode wrong answers (use .map())
  // 6. Shuffle all answers
  // 7. Initialize: answered = false, timerInterval = null, timeRemaining
  constructor(quiz, container, onQuizEnd) {
    // 1. Store the three parameters
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;

    // 2. Get question data
    this.questionData = quiz.getCurrentQuestion();

    // 3. Store current index
    this.index = quiz.currentQuestionIndex;

    // 4. Decode question text, correct answer, and category
    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);

    // 5. Decode all wrong answers using map
    this.wrongAnswers = this.questionData.incorrect_answers.map((answer) => {
      return this.decodeHtml(answer);
    });

    // 6. Shuffle all answers together
    this.allAnswers = this.shuffleAnswers();

    // 7. Initialize state
    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 15;
  }

  // TODO: Create decodeHtml(html) method
  // Use DOMParser to decode HTML entities
  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
  }

  // TODO: Create shuffleAnswers() method
  // 1. Combine wrongAnswers and correctAnswer into one array
  // 2. Shuffle using Fisher-Yates algorithm
  // 3. Return shuffled array
  shuffleAnswers() {
    // 1. Combine all answers into one array
    const answers = [...this.wrongAnswers, this.correctAnswer];

    // 2. Fisher-Yates shuffle
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    // 3. Return shuffled array
    return answers;
  }

  // TODO: Create getProgress() method
  // Calculate: ((index + 1) / quiz.numberOfQuestions) * 100
  // Round to whole number
  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  // TODO: Create displayQuestion() method
  // 1. Create HTML string for the question card
  //    (See index.html for the structure to use)
  // 2. Use template literals with ${} for dynamic data
  // 3. Set this.container.innerHTML = yourHTML
  // 4. Call this.addEventListeners()
  // 5. Call this.startTimer()
  displayQuestion() {
    // 1 & 2. Build answer buttons HTML
    let answersHTML = "";
    for (let i = 0; i < this.allAnswers.length; i++) {
      answersHTML += `<button class="answer-btn" data-answer="${this.allAnswers[i]}">
          <span class="answer-key">${i + 1}</span>
          <span class="answer-text">${this.allAnswers[i]}</span>
        </button>`;
    }

    // Build difficulty icon based on difficulty level
    let difficultyIcon = "fa-face-smile";
    if (this.quiz.difficulty === "medium") difficultyIcon = "fa-face-meh";
    if (this.quiz.difficulty === "hard") difficultyIcon = "fa-skull";

    // Build keyboard hint based on number of answers
    const keyCount = this.allAnswers.length;
    const keyHint =
      keyCount === 2 ? "Press 1-2 to select" : "Press 1-4 to select";

    // 3. Set container HTML
    this.container.innerHTML = `<div class="game-card question-card">

        <div class="xp-bar-container">
          <div class="xp-bar-header">
            <span class="xp-label"><i class="fa-solid fa-bolt"></i> Progress</span>
            <span class="xp-value">Question ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
          <div class="xp-bar">
            <div class="xp-bar-fill" style="width: ${this.getProgress()}%"></div>
          </div>
        </div>

        <div class="stats-row">
          <div class="stat-badge category">
            <i class="fa-solid fa-bookmark"></i>
            <span>${this.category}</span>
          </div>
          <div class="stat-badge difficulty ${this.quiz.difficulty}">
            <i class="fa-solid ${difficultyIcon}"></i>
            <span>${this.quiz.difficulty}</span>
          </div>
          <div class="stat-badge timer" id="timerBadge">
            <i class="fa-solid fa-stopwatch"></i>
            <span class="timer-value" id="timerDisplay">${this.timeRemaining}</span>s
          </div>
          <div class="stat-badge counter">
            <i class="fa-solid fa-gamepad"></i>
            <span>${this.index + 1}/${this.quiz.numberOfQuestions}</span>
          </div>
        </div>

        <h2 class="question-text">${this.question}</h2>

        <div class="answers-grid">
          ${answersHTML}
        </div>

        <p class="keyboard-hint">
          <i class="fa-regular fa-keyboard"></i> ${keyHint}
        </p>

        <div class="score-panel">
          <div class="score-item">
            <div class="score-item-label">Score</div>
            <div class="score-item-value" id="scoreDisplay">${this.quiz.score}</div>
          </div>
        </div>

      </div>`;

    // 4. Add event listeners
    this.addEventListeners();

    // 5. Start timer
    this.startTimer();
  }

  // TODO: Create addEventListeners() method
  // 1. Get all answer buttons: document.querySelectorAll('.answer-btn')
  // 2. Add click event to each: call this.checkAnswer(button)
  // 3. Add keyboard support: listen for keys 1-4
  //    Valid keys are: ['1', '2', '3', '4']
  addEventListeners() {
    // 1. Get all answer buttons
    const buttons = document.querySelectorAll(".answer-btn");

    // 2. Add click event to each button
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", () => {
        this.checkAnswer(buttons[i]);
      });
    }

    // 3. Add keyboard support (store reference so we can remove it later)
    this.keyboardHandler = (e) => {
      const validKeys = ["1", "2", "3", "4"];
      if (validKeys.includes(e.key)) {
        const keyIndex = parseInt(e.key) - 1;
        const allButtons = document.querySelectorAll(".answer-btn");
        if (allButtons[keyIndex]) {
          this.checkAnswer(allButtons[keyIndex]);
        }
      }
    };

    document.addEventListener("keydown", this.keyboardHandler);
  }

  // TODO: Create removeEventListeners() method
  // Remove any keyboard listeners you added
  removeEventListeners() {
    document.removeEventListener("keydown", this.keyboardHandler);
  }

  // TODO: Create startTimer() method
  // 1. Get timer display element
  // 2. Use setInterval to run every 1000ms (1 second)
  // 3. Decrement timeRemaining
  // 4. Update the display
  // 5. If timeRemaining <= 5 seconds, add 'warning' class
  // 6. If timeRemaining <= 0, call stopTimer() and handleTimeUp()
  startTimer() {
    // 1. Get timer elements
    const timerDisplay = document.getElementById("timerDisplay");
    const timerBadge = document.getElementById("timerBadge");

    // 2. Start interval every 1000ms
    this.timerInterval = setInterval(() => {
      // 3. Decrement time
      this.timeRemaining = this.timeRemaining - 1;

      // 4. Update the display
      timerDisplay.textContent = this.timeRemaining;

      // 5. Add warning class when <= 5 seconds remaining
      if (this.timeRemaining <= 5) {
        timerBadge.classList.add("warning");
      }

      // 6. Time is up — stop and handle
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  // TODO: Create stopTimer() method
  // Use clearInterval(this.timerInterval)
  stopTimer() {
    clearInterval(this.timerInterval);
    
  }

  // TODO: Create handleTimeUp() method
  // 1. Set answered = true
  // 2. Call removeEventListeners()
  // 3. Show correct answer (add 'correct' class)
  // 4. Show "TIME'S UP!" message
  // 5. Call animateQuestion() after a delay
  handleTimeUp() {
    // 1. Set answered = true
    this.answered = true;

    // 2. Call removeEventListeners()
    this.removeEventListeners();

    // 3. Show correct answer
    this.highlightCorrectAnswer();

    // 4. Show "TIME'S UP!" message — insert before answers-grid
    const answersGrid = document.querySelector(".answers-grid");
    const timeUpMessage = document.createElement("div");
    timeUpMessage.className = "time-up-message";
    timeUpMessage.innerHTML = `<i class="fa-solid fa-clock"></i> TIME'S UP!`;
    answersGrid.insertAdjacentElement("beforebegin", timeUpMessage);

    // 5. Call animateQuestion() after a delay
    this.animateQuestion(400);
  }

  // TODO: Create checkAnswer(choiceElement) method
  // 1. If already answered, return early
  // 2. Set answered = true
  // 3. Stop the timer
  // 4. Get selected answer from data-answer attribute
  // 5. Compare with correctAnswer (case insensitive)
  // 6. If correct: add 'correct' class, call quiz.incrementScore()
  // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
  // 8. Disable other buttons (add 'disabled' class)
  // 9. Call animateQuestion()
  checkAnswer(choiceElement) {
    // 1. If already answered, return early
    if (this.answered) return;

    // 2. Set answered = true
    this.answered = true;

    // 3. Stop the timer
    this.stopTimer();

    // 4. Get selected answer from data-answer attribute
    const selectedAnswer = choiceElement.dataset.answer;

    // 5. Compare with correctAnswer (case insensitive)
    const isCorrect =
      selectedAnswer.toLowerCase() === this.correctAnswer.toLowerCase();

    if (isCorrect) {
      // 6. If correct: add 'correct' class, call quiz.incrementScore()
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();

      const correctSound = new Audio(
        "./sounds/mixkit-correct-answer-tone-2870.wav",
      );
      correctSound.play();

      // Update score display immediately
      const scoreDisplay = document.getElementById("scoreDisplay");
      if (scoreDisplay) {
        scoreDisplay.textContent = this.quiz.score;
      }
    } else {
      // 7. If wrong: add 'wrong' class, call highlightCorrectAnswer()
      choiceElement.classList.add("wrong");
      this.highlightCorrectAnswer();

      const wrongSound = new Audio(
        "./sounds/mixkit-game-show-wrong-answer-buzz-950.wav",
      );
      wrongSound.play();
    }

    // 8. Disable other buttons (add 'disabled' class)
    const allButtons = document.querySelectorAll(".answer-btn");
    for (let i = 0; i < allButtons.length; i++) {
      if (allButtons[i] !== choiceElement) {
        allButtons[i].classList.add("disabled");
      }
    }

    // 9. Call animateQuestion()
    this.animateQuestion(400);
  }

  // TODO: Create highlightCorrectAnswer() method
  // Find the button with correct answer and add 'correct-reveal' class
  highlightCorrectAnswer() {
    const allButtons = document.querySelectorAll(".answer-btn");
    for (let i = 0; i < allButtons.length; i++) {
      if (allButtons[i].dataset.answer === this.correctAnswer) {
        allButtons[i].classList.add("correct-reveal");
      }
    }
  }

  // TODO: Create getNextQuestion() method
  // 1. Call quiz.nextQuestion()
  // 2. If returns true: create new Question and display it
  // 3. If returns false: show results using quiz.endQuiz()
  //    Also add click listener to Play Again button
  getNextQuestion() {
    // 1. Call quiz.nextQuestion()
    const hasMore = this.quiz.nextQuestion();

    if (hasMore) {
      // 2. If returns true: create new Question and display it
      const nextQuestion = new Question(
        this.quiz,
        this.container,
        this.onQuizEnd,
      );
      nextQuestion.displayQuestion();
    } else {
      const resultsSound = new Audio("./sounds/mixkit-wrong-answer-fail-notification-946.wav");
      resultsSound.play();
      // 3. If returns false: show results using quiz.endQuiz()
      this.container.innerHTML = this.quiz.endQuiz();

      // Also add click listener to Play Again button
      const playAgainBtn = document.getElementById("playAgainBtn");
      if (playAgainBtn) {
        playAgainBtn.addEventListener("click", () => {
          this.onQuizEnd();
        });
      }
    }
  }

  // TODO: Create animateQuestion(duration) method
  // 1. Wait for 1500ms (transition delay)
  // 2. Add 'exit' class to question card
  // 3. Wait for duration
  // 4. Call getNextQuestion()
  animateQuestion(duration) {
    // 1. Wait for 1500ms (transition delay) so user can see feedback
    setTimeout(() => {
      // 2. Add 'exit' class to question card
      const questionCard = document.querySelector(".question-card");
      if (questionCard) {
        questionCard.classList.add("exit");
      }

      // 3. Wait for duration then call getNextQuestion
      setTimeout(() => {
        // 4. Call getNextQuestion()
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }
}
