function loadLeaderboard() {
    return JSON.parse(localStorage.getItem('leaderboard')) || {
        'general': [],
        'science': [],
        'entertainment': [],
        'history': [],
        'sports': []
    };
}

function displayLeaderboard() {
    const category = document.getElementById('category').value;
    const leaderboard = loadLeaderboard();
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';
    
    if (!leaderboard[category] || leaderboard[category].length === 0) {
        list.innerHTML = '<li>No scores available for this category yet.</li>';
        return;
    }

    leaderboard[category].forEach(entry => {
        const li = document.createElement('li');
        const difficultyText = entry.difficulty ? ` (${entry.difficulty})` : '';
        li.innerHTML = `<span>${entry.name}${difficultyText}</span><span>${entry.score} - ${entry.date}</span>`;
        list.appendChild(li);
    });
}

document.addEventListener('DOMContentLoaded', displayLeaderboard);