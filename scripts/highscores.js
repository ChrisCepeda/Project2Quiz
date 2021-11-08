const highScoresList = document.getElementById('highScoresList');
// If localstorage has no scores, set highscores to an empty array
const highScores = JSON.parse(localStorage.getItem('highScores')) || [];

// Sort and display user scores in html
highScoresList.innerHTML = highScores.map(score => {
    return `<li class="high-score">${score.name} - ${score.score}</li>`;
})
.join("");