let currentQuiz = [];
let currentQuestionIndex = 0;
let score = 0;
let currentCategory = '';
let currentDifficulty = '';
let timerId = null;
let timeLeft = 10; 
const tickSound = document.getElementById('tick-sound');

const categoryMap = {
    'general': 9,
    'science': 17,
    'entertainment': 11,
    'history': 23,
    'sports': 21
};

async function fetchQuestions(categoryId, difficulty) {
    const url = `https://opentdb.com/api.php?amount=10&category=${categoryId}&difficulty=${difficulty}&type=multiple`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.response_code === 0) {
            return data.results.map(q => ({
                question: q.question,
                correct: q.correct_answer,
                options: [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5),
                difficulty: q.difficulty
            }));
        } else {
            console.error('API error:', data.response_code);
            return [];
        }
    } catch (error) {
        console.error('Fetch error:', error);
        return [];
    }
}

function startTimer() {
    timeLeft = 10;
    const progressBar = document.getElementById('timer-progress');
    progressBar.style.width = '100%';
    
    if (timerId) clearInterval(timerId);

    timerId = setInterval(() => {
        timeLeft--;
        const percentage = (timeLeft / 10) * 100;
        progressBar.style.width = `${percentage}%`;
        
        if (timeLeft <= 3) {
            progressBar.classList.add('warning');
        } else {
            progressBar.classList.remove('warning');
        }

        tickSound.currentTime = 0; 
        tickSound.play().catch(err => console.log('Audio error:', err)); 

        if (timeLeft <= 0) {
            clearInterval(timerId);
            console.log('Time’s up!');
            currentQuestionIndex++;
            if (currentQuestionIndex < currentQuiz.length) {
                displayQuestion();
            } else {
                showResults();
            }
        }
    }, 1000);
}

function displayQuestion() {
    const questionData = currentQuiz[currentQuestionIndex];
    document.getElementById('question-number').textContent = currentQuestionIndex + 1;
    document.getElementById('question-text').innerHTML = questionData.question;
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, index) => {
        btn.innerHTML = questionData.options[index];
        btn.onclick = () => checkAnswer(btn, questionData.correct, questionData.difficulty);
    });
    document.getElementById('current-score').textContent = score;
    startTimer();
}

function checkAnswer(button, correctAnswer, difficulty) {
    clearInterval(timerId);
    if (button.innerHTML === correctAnswer) {
        let basePoints;
        switch (difficulty) {
            case 'easy': basePoints = 10; break;
            case 'medium': basePoints = 20; break;
            case 'hard': basePoints = 30; break;
            default: basePoints = 10;
        }
        const bonusPoints = timeLeft; 
        score += basePoints + bonusPoints;
        console.log(`Correct! +${basePoints} (base) +${bonusPoints} (time bonus)`);
    } else {
        console.log('Wrong!');
    }
    currentQuestionIndex++;
    if (currentQuestionIndex < currentQuiz.length) {
        displayQuestion();
    } else {
        showResults();
    }
}

function loadLeaderboard() {
    return JSON.parse(localStorage.getItem('leaderboard')) || {
        'general': [],
        'science': [],
        'entertainment': [],
        'history': [],
        'sports': []
    };
}

function saveScore() {
    const playerName = document.getElementById('player-name').value.trim();
    if (!playerName) {
        alert('Please enter your name!');
        return;
    }
    if (!currentCategory || !categoryMap[currentCategory]) {
        console.error('No valid category set for saving score');
        alert('Error: No category selected. Please restart the quiz.');
        return;
    }
    const leaderboard = loadLeaderboard();
    const newEntry = {
        name: playerName,
        score: score,
        date: new Date().toLocaleDateString(),
        difficulty: currentDifficulty
    };
    leaderboard[currentCategory].push(newEntry);
    leaderboard[currentCategory].sort((a, b) => b.score - a.score);
    if (leaderboard[currentCategory].length > 10) leaderboard[currentCategory].length = 10;
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    console.log('Saved leaderboard:', leaderboard);
    document.getElementById('player-name').value = '';
    displayLeaderboard();
}

function displayLeaderboard() {
    const leaderboard = loadLeaderboard();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    if (!currentCategory || !leaderboard[currentCategory]) {
        list.innerHTML = '<li>No scores available for this category yet.</li>';
        return;
    }
    leaderboard[currentCategory].forEach(entry => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${entry.name} (${entry.difficulty})</span><span>${entry.score} - ${entry.date}</span>`;
        list.appendChild(li);
    });
}

async function startQuiz(category, difficulty) {
    currentCategory = category;
    currentDifficulty = difficulty;
    console.log('Starting quiz in category:', currentCategory, 'Difficulty:', currentDifficulty);
    const categoryId = categoryMap[category];
    currentQuiz = await fetchQuestions(categoryId, difficulty);
    if (currentQuiz.length === 0) {
        alert('Failed to load questions. Please try again.');
        return;
    }
    currentQuestionIndex = 0;
    score = 0;
    document.getElementById('main-menu').classList.remove('active');
    document.getElementById('question-view').classList.add('active');
    displayQuestion();
}

function showCustomForm() {
    document.getElementById('custom-form').style.display = 'block';
}

function startCustomQuiz() {
    const category = document.getElementById('custom-category').value;
    const difficulty = document.getElementById('custom-difficulty').value;
    document.getElementById('custom-form').style.display = 'none';
    startQuiz(category, difficulty);
}

function showResults() {
    clearInterval(timerId);
    document.getElementById('question-view').classList.remove('active');
    document.getElementById('results').classList.add('active');
    document.getElementById('final-score').textContent = score;
    document.getElementById('correct-answers').textContent = Math.floor(score / 10); 
    displayLeaderboard();
}

function backToMenu() {
    clearInterval(timerId);
    document.getElementById('results').classList.remove('active');
    document.getElementById('main-menu').classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('results')) {
        displayLeaderboard();
    }
});