
// Just a test for the audio wave, didnt have time to finish or to really understand what was happening
let audioContext = new (window.AudioContext || window.webkitAudioContext)();
let analyser = audioContext.createAnalyser();
let canvas = document.getElementById('spectrumCanvas');
let canvasContext = canvas.getContext('2d');
let bufferLength;
let dataArray;
// ----------- x ---------- //



//Will declare the array for the songs to be played and playbacked.
// It is separate so it can be more organized from the other ones and I dont get confused ;)
let currentTrackIndex = -1;
let tracks = [];
let skipList = new Set(); // filenames to skip
let lastBackPress = 0;

// Normal variables for basic functions
let bar  = document.getElementById("bar");
let song  = document.getElementById("song");
let cntrolIcon  = document.getElementById("playPauseImg");
const previousBtn = document.querySelectorAll('.passSong')[0];
const nextBtn = document.querySelectorAll('.passSong')[1];
let current = document.querySelector(".current-time");
let duration = document.querySelector(".duration-time");


async function opnFolder() {
  const files = await window.electronAPI.selectFolder();

  // Checks if the file is actually a file or has the length (size) of 0 kb
  if (!files || files.length === 0) {
    console.log("No files found or operation was cancelled.");
    noTracksMessage.style.display = 'block'; // Will display the message if no song
    trackList.style.display = 'none'; // Tracklist not showing up (TrackList is the class from the HTML file)
    return;
  }
  console.log("Files loaded:", files);

  noTracksMessage.style.display = 'none'; //Message is gone
  trackList.style.display = 'block'; //The playlist will show up
  trackList.innerHTML = ''; // clear previous tracks
  
  // Will create an ordered list for each file song so it will show it as the playlist
  files.forEach((file, index) => {
    const li = document.createElement('li');
    li.textContent = file.name;
    li.className = 'track';
    
    li.onclick = () => {
      // Remove .active from all tracks so it wont break the code with all songs playing or none at all
      document.querySelectorAll('.track').forEach(el => el.classList.remove('active'));
  
      // Add .active to the clicked track
      li.classList.add('active');
  
      // Play song
      song.src = `file://${file.path.replace(/\\/g, '/')}`;
      song.play();
      cntrolIcon.src = 'Icons/pause-icon.png';
    };
  
    trackList.appendChild(li);
  });
  
}

song.onloadedmetadata = function () {
  bar.max = song.duration;
  bar.value = song.currentTime;
}


// Handles going to next valid song
function playNextTrack() {
  let nextIndex = currentTrackIndex + 1;
  while (nextIndex < tracks.length && skipList.has(tracks[nextIndex].name)) {
    nextIndex++;
  }
  if (nextIndex < tracks.length) {
    playTrack(nextIndex);
  }
}

// Handles going to previous song or restarting
function playPreviousTrack() {
  const now = Date.now();
  // It sets an if statment saying that if the song is longer than 3 seconds or the other press on the button is higher than 800 ms it will back the song
  if (song.currentTime > 3 || now - lastBackPress > 800) {
    song.currentTime = 0;
  } else {
    let prevIndex = currentTrackIndex - 1;
    while (prevIndex >= 0 && skipList.has(tracks[prevIndex].name)) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      playTrack(prevIndex);
    }
  }
  lastBackPress = now;
}

// Will get the songs index inside the folder using arrays, so it can be used as a list and the app will know where to find it.
function playTrack(index) {
  currentTrackIndex = index;
  document.querySelectorAll('.track').forEach(el => el.classList.remove('active'));

  const file = tracks[index];
  const li = document.querySelectorAll('#trackList .track')[index];
  li.classList.add('active');
  song.src = `file://${file.path.replace(/\\/g, '/')}`;
  song.play();
  cntrolIcon.src = 'Icons/pause-icon.png';
}


previousBtn.onclick = playPreviousTrack;
nextBtn.onclick = playNextTrack;

song.addEventListener('ended', playNextTrack);

function playPause(){
        // Check if the image is the play button
        if (cntrolIcon.src.includes('play-icon.png')) {
          // Change to pause icon
          cntrolIcon.src = 'Icons/pause-icon.png';
          song.play();
          
        } else {
          // Change back to play icon
          cntrolIcon.src = 'Icons/play-icon.png'; 
          song.pause();
        }
}

if (song.play()) {
  setInterval(() => {
    bar.value = song.currentTime;
    
    // This function will format the time in order to show it in the correct form, for the minutes and the seconds.
    function formatTime(time) {
      let minutes = Math.floor(time / 60);
      let seconds = Math.floor(time % 60);
      return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
  
    current.textContent = formatTime(song.currentTime);
    duration.textContent = formatTime(song.duration);

  }, 800);
}

// This will make the bar change the play icon to pause icon whenever someone click on it.
// .onchange will check the changes and set the function attributes
bar.onchange = function() {
  song.currentTime = bar.value; //this takes the current time on the original audio control and store into the actual bar
  current = song.currentTime;
  cntrolIcon.src = 'Icons/pause-icon.png';
  song.play();
}