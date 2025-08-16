// Global variables
let is24Hour = false;
let soundEnabled = true;
let isDarkTheme = false;
let countdownInterval = null;
let pomodoroInterval = null;
let countdownTotalSeconds = 0;
let countdownCurrentSeconds = 0;
let pomodoroTotalSeconds = 1500; // 25 minutes default
let pomodoroCurrentSeconds = 1500;
let pomodoroMode = 'work'; // 'work' or 'break'
let pomodoroRunning = false;
let tickSound = null;
let alarmSound = null;

// Initialize audio
function initializeAudio() {
    // Create audio contexts for sound effects
    if (typeof(Audio) !== "undefined") {
        // Simple tick sound using Web Audio API
        tickSound = {
            play: function() {
                if (!soundEnabled) return;
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        };
        
        // Alarm sound
        alarmSound = {
            play: function() {
                if (!soundEnabled) return;
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const oscillator = audioContext.createOscillator();
                        const gainNode = audioContext.createGain();
                        
                        oscillator.connect(gainNode);
                        gainNode.connect(audioContext.destination);
                        
                        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
                        oscillator.frequency.setValueAtTime(1500, audioContext.currentTime + 0.1);
                        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
                        
                        oscillator.start(audioContext.currentTime);
                        oscillator.stop(audioContext.currentTime + 0.3);
                    }, i * 400);
                }
            }
        };
    }
}

// Format time with leading zeros
function formatTime(value) {
    return value.toString().padStart(2, '0');
}

// Get current time
function getCurrentTime() {
    return new Date();
}

// Update main clock
function updateMainClock() {
    const now = getCurrentTime();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    
    // Update time display
    if (is24Hour) {
        document.getElementById('hours').textContent = formatTime(hours);
        document.getElementById('ampm').style.display = 'none';
    } else {
        const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        document.getElementById('hours').textContent = formatTime(displayHours);
        document.getElementById('ampm').textContent = hours >= 12 ? 'PM' : 'AM';
        document.getElementById('ampm').style.display = 'inline';
    }
    
    document.getElementById('minutes').textContent = formatTime(minutes);
    document.getElementById('seconds').textContent = formatTime(seconds);
    
    // Update date
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('dateDisplay').textContent = now.toLocaleDateString('en-US', options);
    
    // Update progress rings
    updateProgressRings(hours, minutes, seconds);
    
    // Update background based on time of day
    updateBackgroundByTime(hours);
    
    // Play tick sound
    if (seconds !== getCurrentTime().getSeconds()) {
        tickSound?.play();
    }
}

// Update progress rings
function updateProgressRings(hours, minutes, seconds) {
    const hoursProgress = ((hours % 12) / 12) * 314;
    const minutesProgress = (minutes / 60) * 314;
    const secondsProgress = (seconds / 60) * 314;
    
    document.getElementById('hoursProgress').style.strokeDashoffset = 314 - hoursProgress;
    document.getElementById('minutesProgress').style.strokeDashoffset = 314 - minutesProgress;
    document.getElementById('secondsProgress').style.strokeDashoffset = 314 - secondsProgress;
}

// Update background based on time of day
function updateBackgroundByTime(hours) {
    const body = document.body;
    body.classList.remove('morning', 'day', 'evening', 'night');
    
    if (hours >= 6 && hours < 12) {
        body.classList.add('morning');
    } else if (hours >= 12 && hours < 17) {
        body.classList.add('day');
    } else if (hours >= 17 && hours < 21) {
        body.classList.add('evening');
    } else {
        body.classList.add('night');
    }
}

// Update world clocks
function updateWorldClocks() {
    const now = getCurrentTime();
    
    // New York (EST/EDT)
    const nyTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
    document.getElementById('nycTime').textContent = formatWorldTime(nyTime);
    
    // London (GMT/BST)
    const londonTime = new Date(now.toLocaleString("en-US", {timeZone: "Europe/London"}));
    document.getElementById('londonTime').textContent = formatWorldTime(londonTime);
    
    // Tokyo (JST)
    const tokyoTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Tokyo"}));
    document.getElementById('tokyoTime').textContent = formatWorldTime(tokyoTime);
}

// Format world time
function formatWorldTime(date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    if (is24Hour) {
        return `${formatTime(hours)}:${formatTime(minutes)}:${formatTime(seconds)}`;
    } else {
        const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        const ampm = hours >= 12 ? 'PM' : 'AM';
        return `${formatTime(displayHours)}:${formatTime(minutes)}:${formatTime(seconds)} ${ampm}`;
    }
}

// Create particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    
    // Create particles periodically
    setInterval(() => {
        if (particlesContainer.children.length < 20) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
            particle.style.animationDelay = Math.random() * 2 + 's';
            
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 6000);
        }
    }, 300);
}

// Add ripple effect
function addRippleEffect(element) {
    element.classList.add('ripple');
    setTimeout(() => {
        element.classList.remove('ripple');
    }, 600);
}

// Add glitch effect
function addGlitchEffect(element) {
    element.classList.add('glitch');
    setTimeout(() => {
        element.classList.remove('glitch');
    }, 300);
}

// Countdown timer functions
function startCountdown() {
    const hours = parseInt(document.getElementById('countdownHours').value) || 0;
    const minutes = parseInt(document.getElementById('countdownMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('countdownSeconds').value) || 0;
    
    countdownTotalSeconds = hours * 3600 + minutes * 60 + seconds;
    countdownCurrentSeconds = countdownTotalSeconds;
    
    if (countdownCurrentSeconds <= 0) {
        alert('Please set a valid countdown time!');
        return;
    }
    
    document.getElementById('startTimer').disabled = true;
    document.getElementById('pauseTimer').disabled = false;
    
    countdownInterval = setInterval(updateCountdown, 1000);
    updateCountdownDisplay();
}

function pauseCountdown() {
    clearInterval(countdownInterval);
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
}

function resetCountdown() {
    clearInterval(countdownInterval);
    countdownCurrentSeconds = 0;
    countdownTotalSeconds = 0;
    
    document.getElementById('startTimer').disabled = false;
    document.getElementById('pauseTimer').disabled = true;
    
    // Reset display
    document.getElementById('countdownDisplayHours').textContent = '00';
    document.getElementById('countdownDisplayMinutes').textContent = '00';
    document.getElementById('countdownDisplaySeconds').textContent = '00';
    
    // Reset progress ring
    document.getElementById('countdownProgress').style.strokeDashoffset = '754';
    document.getElementById('countdownProgress').style.stroke = '#00ff00';
    
    // Remove warning classes
    const countdownParts = document.querySelectorAll('.countdown-part');
    countdownParts.forEach(part => {
        part.classList.remove('warning', 'danger');
    });
}

function updateCountdown() {
    if (countdownCurrentSeconds <= 0) {
        clearInterval(countdownInterval);
        alarmSound?.play();
        alert('Time\'s up!');
        resetCountdown();
        return;
    }
    
    countdownCurrentSeconds--;
    updateCountdownDisplay();
}

function updateCountdownDisplay() {
    const hours = Math.floor(countdownCurrentSeconds / 3600);
    const minutes = Math.floor((countdownCurrentSeconds % 3600) / 60);
    const seconds = countdownCurrentSeconds % 60;
    
    document.getElementById('countdownDisplayHours').textContent = formatTime(hours);
    document.getElementById('countdownDisplayMinutes').textContent = formatTime(minutes);
    document.getElementById('countdownDisplaySeconds').textContent = formatTime(seconds);
    
    // Update progress ring
    const progress = countdownTotalSeconds > 0 ? (countdownCurrentSeconds / countdownTotalSeconds) : 0;
    const strokeDashoffset = 754 * (1 - progress);
    document.getElementById('countdownProgress').style.strokeDashoffset = strokeDashoffset;
    
    // Change colors based on remaining time
    const countdownParts = document.querySelectorAll('.countdown-part');
    const progressRing = document.getElementById('countdownProgress');
    
    if (countdownCurrentSeconds <= 10) {
        countdownParts.forEach(part => {
            part.classList.remove('warning');
            part.classList.add('danger');
        });
        progressRing.style.stroke = '#ff0040';
    } else if (countdownCurrentSeconds <= 60) {
        countdownParts.forEach(part => {
            part.classList.remove('danger');
            part.classList.add('warning');
        });
        progressRing.style.stroke = '#ff8c00';
    } else {
        countdownParts.forEach(part => {
            part.classList.remove('warning', 'danger');
        });
        progressRing.style.stroke = '#00ff00';
    }
}

// Pomodoro timer functions
function startPomodoro() {
    pomodoroRunning = true;
    
    if (pomodoroMode === 'work') {
        pomodoroCurrentSeconds = 1500; // 25 minutes
        document.getElementById('pomodoroStatus').textContent = 'WORKING...';
    } else {
        pomodoroCurrentSeconds = 300; // 5 minutes
        document.getElementById('pomodoroStatus').textContent = 'BREAK TIME...';
    }
    
    pomodoroTotalSeconds = pomodoroCurrentSeconds;
    
    document.getElementById('startPomodoro').disabled = true;
    
    pomodoroInterval = setInterval(updatePomodoro, 1000);
    updatePomodoroDisplay();
}

function updatePomodoro() {
    if (pomodoroCurrentSeconds <= 0) {
        clearInterval(pomodoroInterval);
        alarmSound?.play();
        
        if (pomodoroMode === 'work') {
            alert('Work session complete! Time for a break.');
            pomodoroMode = 'break';
            document.getElementById('workMode').classList.remove('active');
            document.getElementById('breakMode').classList.add('active');
        } else {
            alert('Break time over! Ready to work?');
            pomodoroMode = 'work';
            document.getElementById('breakMode').classList.remove('active');
            document.getElementById('workMode').classList.add('active');
        }
        
        pomodoroRunning = false;
        document.getElementById('startPomodoro').disabled = false;
        document.getElementById('pomodoroStatus').textContent = pomodoroMode === 'work' ? 'READY TO WORK' : 'READY FOR BREAK';
        return;
    }
    
    pomodoroCurrentSeconds--;
    updatePomodoroDisplay();
}

function updatePomodoroDisplay() {
    const minutes = Math.floor(pomodoroCurrentSeconds / 60);
    const seconds = pomodoroCurrentSeconds % 60;
    
    document.getElementById('pomodoroMinutes').textContent = formatTime(minutes);
    document.getElementById('pomodoroSeconds').textContent = formatTime(seconds);
}

// Theme toggle
function toggleTheme() {
    isDarkTheme = !isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    
    const themeIcon = document.querySelector('.theme-icon');
    themeIcon.textContent = isDarkTheme ? '☀️' : '🌙';
    
    // Save to localStorage
    localStorage.setItem('darkTheme', isDarkTheme);
}

// Sound toggle
function toggleSound() {
    soundEnabled = !soundEnabled;
    const soundIcon = document.querySelector('.sound-icon');
    soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    
    // Save to localStorage
    localStorage.setItem('soundEnabled', soundEnabled);
}

// Load saved preferences
function loadPreferences() {
    // Load theme preference
    const savedTheme = localStorage.getItem('darkTheme');
    if (savedTheme === 'true') {
        isDarkTheme = true;
        document.body.classList.add('dark-theme');
        document.querySelector('.theme-icon').textContent = '☀️';
    }
    
    // Load sound preference
    const savedSound = localStorage.getItem('soundEnabled');
    if (savedSound === 'false') {
        soundEnabled = false;
        document.querySelector('.sound-icon').textContent = '🔇';
    }
}

// Initialize the application
function init() {
    // Load preferences
    loadPreferences();
    
    // Initialize audio
    initializeAudio();
    
    // Create particles
    createParticles();
    
    // Update clocks immediately
    updateMainClock();
    updateWorldClocks();
    
    // Set up intervals
    setInterval(updateMainClock, 1000);
    setInterval(updateWorldClocks, 1000);
    
    // Format toggle event listeners
    document.getElementById('format12').addEventListener('click', () => {
        is24Hour = false;
        document.getElementById('format12').classList.add('active');
        document.getElementById('format24').classList.remove('active');
    });
    
    document.getElementById('format24').addEventListener('click', () => {
        is24Hour = true;
        document.getElementById('format24').classList.add('active');
        document.getElementById('format12').classList.remove('active');
    });
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Sound toggle
    document.getElementById('soundToggle').addEventListener('click', toggleSound);
    
    // Countdown timer controls
    document.getElementById('startTimer').addEventListener('click', startCountdown);
    document.getElementById('pauseTimer').addEventListener('click', pauseCountdown);
    document.getElementById('resetTimer').addEventListener('click', resetCountdown);
    
    // Pomodoro controls
    document.getElementById('workMode').addEventListener('click', () => {
        if (!pomodoroRunning) {
            pomodoroMode = 'work';
            document.getElementById('workMode').classList.add('active');
            document.getElementById('breakMode').classList.remove('active');
            document.getElementById('pomodoroMinutes').textContent = '25';
            document.getElementById('pomodoroSeconds').textContent = '00';
            document.getElementById('pomodoroStatus').textContent = 'READY TO WORK';
        }
    });
    
    document.getElementById('breakMode').addEventListener('click', () => {
        if (!pomodoroRunning) {
            pomodoroMode = 'break';
            document.getElementById('breakMode').classList.add('active');
            document.getElementById('workMode').classList.remove('active');
            document.getElementById('pomodoroMinutes').textContent = '05';
            document.getElementById('pomodoroSeconds').textContent = '00';
            document.getElementById('pomodoroStatus').textContent = 'READY FOR BREAK';
        }
    });
    
    document.getElementById('startPomodoro').addEventListener('click', startPomodoro);
    
    // Add hover effects to time parts
    const timeParts = document.querySelectorAll('.time-part');
    timeParts.forEach(part => {
        part.addEventListener('mouseenter', () => {
            addRippleEffect(part);
        });
        
        part.addEventListener('click', () => {
            addGlitchEffect(part);
        });
    });
    
    // Add hover effects to world clocks
    const worldClocks = document.querySelectorAll('.world-clock');
    worldClocks.forEach(clock => {
        clock.addEventListener('mouseenter', () => {
            addRippleEffect(clock);
        });
    });
    
    // Input validation for countdown
    const countdownInputs = ['countdownHours', 'countdownMinutes', 'countdownSeconds'];
    countdownInputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('input', () => {
            const value = parseInt(input.value);
            if (value < 0 || isNaN(value)) {
                input.value = 0;
            }
            if (id === 'countdownHours' && value > 23) {
                input.value = 23;
            }
            if ((id === 'countdownMinutes' || id === 'countdownSeconds') && value > 59) {
                input.value = 59;
            }
        });
    });
    
    console.log('Futuristic Digital Clock initialized successfully!');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);