# The SpotiyQuiz

---

Hyper Island - If this, then that Module - Brief 2.

### :open_file_folder: The Brief:

- Use firebase to create an app (preferably quiz).

### :hourglass_flowing_sand: Time spent / Deadline:

2 weeks.

### :dart: Goals:

- Integrate firebase dependencies for user authentication and scoring.
- Develop improved Git workflow and work on branches individually.
- Use agile/scrum/kanban methodologies.
- Challenge our JS knowledge and look to develop skills.
- Learn more about APIs and how to use them.

### :mechanical_arm: The process:

The idea behind this project was to have a quiz that used the Spotify API to build a quiz based on audio snippets.

Using the node package "Spotify-Web" we grab a set of different datapoints, primarily playlists.

Different playlists were used to determine quiz-themes, from which songs were picked as "questions".

For each question a collection of incorrect answer choices are picked from the active artist, with checks
in place to avoid alternative versions of the same original song (i.e. "Radio edit", "Live", "Acapella").

To organize the work and to have an agile workfolow we used Trello, dividing tasks based on working prefrences.

Firebase was used to easily store and retrieve the data and to authenticate users. The data was used to display global highscores connected the user.

### :grimacing: Challanges:

- Working in multiple Javascript files, using functions from one file in another.
- Storing user scores during page loading
- Spotify API authentication / access-token / expiriation time etc.
- Setting username in Firebase and later retrieving it for displaying highscores.

### :man_student: Learnings:

- Deeper understanding of JS.
- Basic knowledge of Firebase - Firestore / Fireauth
- Improved use of Github - worked smoothly on separate branches.
- Scratching the surface of NodeJS and its packages.
- Familiarizing ourselves with large APIs

### :computer: Tech used in this specific repository:

- Github
- HTML
- CSS
- SCSS
- JavaScript
- Firebase
- Trello
- Spotify API

### :family_woman_woman_boy_boy: Contributors:

- [Birk Kensén](https://github.com/ChrisCepeda)
- [Johan Klingström](https://github.com/maybelittlebitjk)
- [Tintin Hamrin](https://github.com/TintinHamrin)
- [Christina Cepeda](https://github.com/ChrisCepeda)
