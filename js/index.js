/**
 * ============================================
 * MAIN ENTRY POINT (index.js)
 * ============================================
 *
 * This file is the starting point of your application.
 * It handles:
 * - Getting DOM elements
 * - Form validation
 * - Starting the quiz
 * - Loading/error states
 *
 * DOM ELEMENTS TO GET:
 * - quizOptionsForm: #quizOptions
 * - playerNameInput: #playerName
 * - categoryInput: #categoryMenu
 * - difficultyOptions: #difficultyOptions
 * - questionsNumber: #questionsNumber
 * - startQuizBtn: #startQuiz
 * - questionsContainer: .questions-container
 *
 * FUNCTIONS TO IMPLEMENT:
 * - showLoading() - Display loading spinner
 * - hideLoading() - Remove loading spinner
 * - showError(message) - Display error card
 * - validateForm() - Check if form is valid
 * - showFormError(message) - Show error on form
 * - resetToStart() - Reset to initial state
 * - startQuiz() - Main function to start quiz
 */

import Quiz from "./quiz.js";
import Question from "./question.js";


// ============================================
// TODO: Get DOM Element References
// ============================================
// Use document.getElementById() and document.querySelector()
const quizOptionsForm = document.getElementById("quizOptions");
const playerNameInput = document.getElementById("playerName");
const categoryInput = document.getElementById("categoryMenu");
const difficultyOptions = document.getElementById("difficultyOptions");
const questionsNumber = document.getElementById("questionsNumber");
const startQuizBtn = document.getElementById("startQuiz");
const questionsContainer = document.querySelector(".questions-container");


// ============================================
// TODO: Create variable to store current quiz
// ============================================
// let currentQuiz = null;
let currentQuiz = null;


// ============================================
// TODO: Create showLoading() function
// ============================================
// Set questionsContainer.innerHTML to loading HTML
// See index.html for the HTML structure
function showLoading() {
  questionsContainer.innerHTML =
    `<div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Questions...</p>
    </div>`;
}


// ============================================
// TODO: Create hideLoading() function
// ============================================
// Find and remove the loading overlay
function hideLoading() {
  const loadingOverlay = document.querySelector(".loading-overlay");
  if (loadingOverlay) {
    loadingOverlay.remove();
  }
}


// ============================================
// TODO: Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()
function showError(message) {
  questionsContainer.innerHTML =
    `<div class="game-card error-card">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="error-title">Oops! Something went wrong</h3>
      <p class="error-message">${message}</p>
      <button class="btn-play retry-btn">
        <i class="fa-solid fa-rotate-right"></i> Try Again
      </button>
    </div>`;

  // Add click listener to retry button that calls resetToStart()
  const retryBtn = document.querySelector(".retry-btn");
  if (retryBtn) {
    retryBtn.addEventListener("click", function () {
      resetToStart();
    });
  }
}


// ============================================
// TODO: Create validateForm() function
// ============================================
// Return object: { isValid: boolean, error: string | null }
// Check:
// 1. questionsNumber has a value
// 2. Value is >= 1 (minimum questions)
// 3. Value is <= 50 (maximum questions)
function validateForm() {
  const value = questionsNumber.value;

  // 1. Check questionsNumber has a value
  if (!value) {
    return { isValid: false, error: "Please enter the number of questions." };
  }

  const num = parseInt(value);

  // 2. Value is >= 1 (minimum questions)
  if (num < 1) {
    return { isValid: false, error: "Minimum number of questions is 1." };
  }

  // 3. Value is <= 50 (maximum questions)
  if (num > 50) {
    return { isValid: false, error: "Maximum number of questions is 50." };
  }

  return { isValid: true, error: null };
}


// ============================================
// TODO: Create showFormError(message) function
// ============================================
// Create error div with class 'form-error'
// Insert before the start button
// Remove after 3 seconds with fade effect
function showFormError(message) {
  // Remove any existing error first
  const existingError = document.querySelector(".form-error");
  if (existingError) {
    existingError.remove();
  }

  // Create error div with class 'form-error'
  const errorDiv = document.createElement("div");
  errorDiv.className = "form-error";
  errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

  // Insert before the start button
  startQuizBtn.insertAdjacentElement("beforebegin", errorDiv);

  // Remove after 3 seconds
  setTimeout(function () {
    if (errorDiv) {
      errorDiv.remove();
    }
  }, 3000);
}


// ============================================
// TODO: Create resetToStart() function
// ============================================
// 1. Clear questionsContainer
// 2. Reset form values
// 3. Show the form (remove 'hidden' class)
// 4. Set currentQuiz = null
function resetToStart() {
  // 1. Clear questionsContainer
  questionsContainer.innerHTML = "";

  // 2. Reset form values
  playerNameInput.value = "";
  questionsNumber.value = "10";

  // 3. Show the form (remove 'hidden' class)
  quizOptionsForm.classList.remove("hidden");

  // 4. Set currentQuiz = null
  currentQuiz = null;
}


// ============================================
// TODO: Create async startQuiz() function
// ============================================
// This is the main function, called when Start button is clicked
//
// Steps:
// 1. Validate the form
// 2. If not valid, show error and return
// 3. Get form values:
//    - playerName (use 'Player' if empty)
//    - category
//    - difficulty
//    - numberOfQuestions
// 4. Create new Quiz instance
// 5. Hide the form (add 'hidden' class)
// 6. Show loading spinner
// 7. Try to fetch questions:
//    - await currentQuiz.getQuestions()
//    - Hide loading
//    - Check if questions exist
//    - Create first Question and display it
// 8. Catch any errors:
//    - Hide loading
//    - Show error message
async function startQuiz() {
  // 1. Validate the form
  const validation = validateForm();

  // 2. If not valid, show error and return
  if (!validation.isValid) {
    showFormError(validation.error);
    return;
  }

  // 3. Get form values
  const playerName = playerNameInput.value.trim() || "Player";
  const category = categoryInput.value;
  const difficulty = difficultyOptions.value;
  const numberOfQuestions = parseInt(questionsNumber.value);

  // 4. Create new Quiz instance
  currentQuiz = new Quiz(category, difficulty, numberOfQuestions, playerName);

  // 5. Hide the form (add 'hidden' class)
  quizOptionsForm.classList.add("hidden");

  // 6. Show loading spinner
  showLoading();

  try {
    // 7. Fetch questions
    await currentQuiz.getQuestions();

    // Hide loading
    hideLoading();

    // Check if questions exist
    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
      showError("No questions found. Please try different settings.");
      return;
    }

    // Create first Question and display it
    const firstQuestion = new Question(currentQuiz, questionsContainer, resetToStart);
    firstQuestion.displayQuestion();

  } catch (error) {
    // 8. Catch any errors
    hideLoading();
    showError(error.message);
  }
}


// ============================================
// TODO: Add Event Listeners
// ============================================
// 1. startQuizBtn click -> call startQuiz()
// 2. questionsNumber keydown -> if Enter, call startQuiz()

// 1. Start button click
startQuizBtn.addEventListener("click", function () {
  startQuiz();
});

// 2. Enter key on questions number input
questionsNumber.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    startQuiz();
  }
});