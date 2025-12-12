// --- Global Variables ---
// CHANGED to 'let' so we can update the time based on user selection
let TIMER_SECONDS = 30; 
const sentences = [
    "I like to take my dog to the park every day after school. We walk along the smooth, quiet path near the tall trees. The sun is warm, and the fresh air feels good. My dog chases the big, bouncy blue ball, and I sit on a clean, wooden bench. It is a simple and perfect time for us.",
    "Reading a good book helps me learn many new things about the world. I enjoy sitting on a comfy chair with a soft blanket over my legs. The paper pages feel nice, and the black text is easy to follow. I travel to far-off places and meet friendly people, all without leaving my room. This quiet habit helps me relax.",
    "Learning to cook a simple meal is a fun way to start. We can make a quick salad with lettuce, tomatoes, and crisp green peppers. First, we must wash the vegetables very well in the sink. Then, we cut them into small, safe pieces on a white cutting board. A little bit of oil and vinegar makes the taste better.",
    "Blue is my favorite color to see. The summer sky above us is often bright blue, especially right before noon. The deep water in the ocean and the lake is also this same cool shade. It is a calm, peaceful color that makes me feel happy and safe when I look at it. I paint almost all my small pictures using this color.",
    "Keeping my own room neat is not always easy, but it is important to try. Every Saturday morning, I put all my toys back inside the big yellow box. I wipe the dust from my desk and make sure the floor is clear. A clean space helps me think better and find what I need quickly. It is a good job to finish early."
];

let timeLeft = TIMER_SECONDS;
let timerInterval = null;
let currentSentence = "";
let isTyping = false;

// >> NEW TRACKING VARIABLES <<
let totalErrors = 0;        // Counts every keypress error, even if corrected later.
let charactersTyped = 0;    // Counts only non-backspace characters.
let correctCharacters = 0;  // Counts the number of correct final characters.

// --- DOM Elements ---
const timerDisplay = document.getElementById('timer');
const textDisplay = document.getElementById('text-display');
const inputField = document.getElementById('input-field');
const startBtn = document.getElementById('start-btn');
const wpmDisplay = document.getElementById('wpm');
const accuracyDisplay = document.getElementById('accuracy');
// ADDED: Select the timer options container and buttons
const timerOptionsDiv = document.getElementById('timer-options');
const timeOptionButtons = document.querySelectorAll('.time-option'); 
// ADDED: Select the main container (needed if you added the hourglass animation control)
const container = document.querySelector('.container'); 


// --- Main Functions ---

/**
 * Loads a random sentence and resets character counters.
 */
function loadSentence() {
    const randomIndex = Math.floor(Math.random() * sentences.length);
    currentSentence = sentences[randomIndex];

    textDisplay.innerHTML = currentSentence
        .split('')
        .map(char => `<span>${char}</span>`)
        .join('');
}

function startTimer() {
    clearInterval(timerInterval);
    // Uses the current TIMER_SECONDS value
    timeLeft = TIMER_SECONDS; 
    timerDisplay.textContent = timeLeft;
    
    // If you implemented the hourglass, start the animation here
    if (container) container.classList.add('timer-running');

    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            endTest();
        }
    }, 1000);
}

/**
 * Calculates and displays the final WPM and Accuracy using tracked errors.
 */
function endTest() {
    clearInterval(timerInterval);
    inputField.disabled = true;
    startBtn.textContent = "Restart";
    isTyping = false;
    
    // If you implemented the hourglass, stop the animation here
    if (container) container.classList.remove('timer-running');

    // Time in Minutes is the total time the test ran for (e.g., 30s / 60)
    const timeInMinutes = TIMER_SECONDS / 60; 
    
    // --- 1. Calculate ACCURACY (Raw Accuracy) ---
    const totalKeystrokes = correctCharacters + totalErrors;

    const accuracy = totalKeystrokes > 0 
        ? Math.round((correctCharacters / totalKeystrokes) * 100) 
        : 0;

    // --- 2. Calculate WPM (Net WPM) ---
    const wordsCorrected = (correctCharacters / 5);
    const wordsError = (totalErrors / 5);
    
    const netWPM = Math.max(0, Math.round((wordsCorrected - wordsError) / timeInMinutes));
    
    // --- Display Results ---
    wpmDisplay.textContent = netWPM;
    accuracyDisplay.textContent = accuracy;
}

/**
 * Handles input as the user types, styling characters and tracking errors.
 */
function handleInput(event) {
    if (!isTyping) {
        startTimer();
        isTyping = true;
    }

    const typedText = inputField.value;
    const sentenceChars = textDisplay.querySelectorAll('span');
    
    // Check if the key pressed was a normal character or a backspace
    const isBackspace = event.inputType === 'deleteContentBackward';
    
    // --- Error Tracking Logic ---
    if (!isBackspace) {
        // If the user types a character
        const currentTypedIndex = typedText.length - 1;
        const charTyped = typedText[currentTypedIndex];
        const charInSentence = currentSentence[currentTypedIndex];

        if (charTyped) { // Ensure a character was actually typed
            if (charTyped === charInSentence) {
                correctCharacters++;
            } else {
                totalErrors++; // Increment total errors for WPM/Accuracy penalty
            }
        }
    } 
    // Note: Backspace itself doesn't decrease the tracked errors (totalErrors),
    // which achieves the Monkeytype-style permanent error penalty.

    // --- UI Coloring Logic ---
    let currentErrors = 0; // Temp counter for UI coloring only
    
    sentenceChars.forEach((charSpan, index) => {
        const charInSentence = currentSentence[index];
        const charTyped = typedText[index];

        charSpan.classList.remove('correct', 'incorrect');

        if (charTyped == null) {
            // Character not yet typed
            // No class needed
        } else if (charTyped === charInSentence) {
            // Correct character
            charSpan.classList.add('correct');
        } else {
            // Incorrect character
            charSpan.classList.add('incorrect');
            currentErrors++; // Only count current, visible errors for cursor/UI
        }
    });

    // End test early if the user finishes the entire sentence
    if (typedText.length === currentSentence.length) {
        endTest();
    }
}

/**
 * Resets the game state and starts a new test.
 */
function startTest() {
    // 1. Reset variables
    clearInterval(timerInterval);
    // Uses the current TIMER_SECONDS value
    timeLeft = TIMER_SECONDS; 
    isTyping = false;
    
    // If you implemented the hourglass, reset the animation state here
    if (container) container.classList.remove('timer-running');
    
    // >> RESET TRACKING VARIABLES <<
    totalErrors = 0;
    correctCharacters = 0;
    
    // 2. Reset DOM elements
    // Uses the current TIMER_SECONDS value
    timerDisplay.textContent = TIMER_SECONDS; 
    inputField.value = "";
    inputField.disabled = false;
    inputField.focus();
    startBtn.textContent = "Restart";
    wpmDisplay.textContent = 0;
    accuracyDisplay.textContent = 0;

    // 3. Load a new sentence
    loadSentence();
}

// --- NEW Function: Handle Time Selection ---
function handleTimeSelection(event) {
    // Ensure we clicked a button with the class 'time-option'
    if (!event.target.classList.contains('time-option')) return;
    
    const targetButton = event.target;
    // Get the time value from the data-time attribute (30 or 60)
    const selectedTime = parseInt(targetButton.getAttribute('data-time'));

    // Only update if a different button is clicked AND test is not running
    if (selectedTime && selectedTime !== TIMER_SECONDS && !isTyping) {
        
        // 1. Update the global variable
        TIMER_SECONDS = selectedTime; 
        
        // 2. Update the CSS selection class
        timeOptionButtons.forEach(btn => btn.classList.remove('selected'));
        targetButton.classList.add('selected');
        
        // 3. Reset test UI and timer display
        startTest();
    }
}

// --- Event Listeners ---
inputField.addEventListener('input', handleInput);
startBtn.addEventListener('click', startTest);

// ADDED: Listener for the new time buttons container
if (timerOptionsDiv) {
    timerOptionsDiv.addEventListener('click', handleTimeSelection);
}

// If Enter is clicked it is of start and restart
document.addEventListener('keydown', (event) => {
    // Check if the key pressed is the Enter key (key code 13 or 'Enter')
    // AND if the input field is disabled (test is over)
    if (event.key === 'Enter' && inputField.disabled) {
        
        event.preventDefault(); // Prevents default browser actions (like scrolling or form submission)
        
        startTest(); // Calls the function to reset and start a new test
        
        inputField.focus(); // Immediately places the cursor in the input field
    }
});

// --- Initialization ---
loadSentence();