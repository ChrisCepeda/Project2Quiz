const username = document.getElementById('username');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const finalScore = document.getElementById('finalScore');
const mostRecentScore = localStorage.getItem('mostRecentScore');
const highScores = JSON.parse(localStorage.getItem("highScores")) || [];
const MAX_HIGH_SCORES = 5;

finalScore.innerText = mostRecentScore;

username.addEventListener('keyup', () => {
    saveScoreBtn.disabled = !username.value;
})

saveHighScore = e => {
    // Disables default form send functionality
    e.preventDefault();

    // Set score
    const score = {
        score: mostRecentScore,
        name: username.value
    };

    // Adds the new score, sorts array accordingly, and remove last (6th) item in array
    highScores.push(score);
    highScores.sort( (a,b) => b.score - a.score);
    highScores.splice(5);

    // Update storage with array
    localStorage.setItem('highScores', JSON.stringify(highScores));
    // Send user back to index.html
    window.location.assign('/');
}