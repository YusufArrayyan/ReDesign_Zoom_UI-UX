// App State
let isSharingScreen = false;

// DOM Elements
const btnToggleShare = document.getElementById('toggle-share-btn');
const viewVideoGrid = document.getElementById('video-grid-view');
const viewShareScreen = document.getElementById('share-screen-view');

const tabChat = document.getElementById('tab-chat');
const tabParticipants = document.getElementById('tab-participants');
const btnTabChat = document.querySelector('.tab-btn[onclick="switchTab(\'chat\')"]');
const btnTabParticipants = document.querySelector('.tab-btn[onclick="switchTab(\'participants\')"]');

// Toggle Share Screen View
btnToggleShare.addEventListener('click', () => {
    isSharingScreen = !isSharingScreen;
    const viewWhiteboard = document.getElementById('whiteboard-view');
    
    if (isSharingScreen) {
        viewVideoGrid.classList.remove('active');
        if(viewWhiteboard) viewWhiteboard.classList.remove('active');
        viewShareScreen.classList.add('active');
        
        btnToggleShare.classList.add('active');
        btnToggleShare.title = "Stop Share";
        btnToggleShare.innerHTML = '<span class="material-symbols-rounded">cancel_presentation</span>';
        
        const btnWb = document.getElementById('btn-whiteboard');
        if(btnWb) btnWb.classList.remove('active');
    } else {
        viewShareScreen.classList.remove('active');
        viewVideoGrid.classList.add('active');
        
        btnToggleShare.classList.remove('active');
        btnToggleShare.title = "Share Screen";
        btnToggleShare.innerHTML = '<span class="material-symbols-rounded">present_to_all</span>';
    }
});

// Switch Tabs in the Integrated Side-Panel
function switchTab(tabName) {
    if (tabName === 'chat') {
        // Show Chat, Hide Participants
        tabChat.classList.add('active');
        tabParticipants.classList.remove('active');
        
        // Update button states
        btnTabChat.classList.add('active');
        btnTabParticipants.classList.remove('active');
    } else if (tabName === 'participants') {
        // Show Participants, Hide Chat
        tabParticipants.classList.add('active');
        tabChat.classList.remove('active');
        
        // Update button states
        btnTabParticipants.classList.add('active');
        btnTabChat.classList.remove('active');
    }
}

// Open side panel directly from bottom control bar
function toggleSidePanel(tabName) {
    // If not sharing screen, simulate switching to share screen mode to show the side panel
    // (In a real app, it might open a floating window or dock it differently in grid view, 
    // but for this redesign focus, we show it docked).
    if (!isSharingScreen) {
        btnToggleShare.click(); // Trigger share screen to show panel
    }
    
    // Switch to the requested tab
    switchTab(tabName);
}

// Screen and Modal Management
const homeScreen = document.getElementById('home-screen');
const meetingScreen = document.getElementById('meeting-screen');
const inviteModal = document.getElementById('invite-modal');
const btnCloseModal = document.getElementById('btn-close-modal');
const btnCopyLink = document.getElementById('btn-copy-link');

function startMeeting() {
    // Hide home, show meeting
    homeScreen.classList.remove('active');
    meetingScreen.classList.add('active');
    
    // Automatically show invite modal as per the new UX flow
    setTimeout(() => {
        inviteModal.classList.add('active');
    }, 500);
}

if(btnCloseModal) {
    btnCloseModal.addEventListener('click', () => {
        inviteModal.classList.remove('active');
    });
}

if(btnCopyLink) {
    btnCopyLink.addEventListener('click', () => {
        const linkInput = document.getElementById('invite-link-input');
        linkInput.select();
        // Fallback for clipboard if not in https/localhost context
        try {
            navigator.clipboard.writeText(linkInput.value);
        } catch(err) {
            document.execCommand("copy");
        }
        
        // Visual feedback
        const originalText = btnCopyLink.innerText;
        btnCopyLink.innerText = 'Copied!';
        btnCopyLink.style.backgroundColor = '#4CAF50'; // Green success
        
        setTimeout(() => {
            inviteModal.classList.remove('active');
            // reset
            setTimeout(() => {
                btnCopyLink.innerText = originalText;
                btnCopyLink.style.backgroundColor = '';
            }, 300);
        }, 1500);
    });
}

// Real-time clock update
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.textContent = timeStr;
    const bottomTimeEl = document.querySelector('.bottom-time');
    if(bottomTimeEl) bottomTimeEl.textContent = timeStr;
    
    // Home screen clock
    const homeTimeEl = document.getElementById('home-time-display');
    if(homeTimeEl) homeTimeEl.textContent = timeStr;
    
    // Home Date
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    const dateStr = now.toLocaleDateString('en-US', options);
    const homeDateEl = document.getElementById('home-date-display');
    if(homeDateEl) homeDateEl.textContent = dateStr;
}

// The old inert button events have been replaced by the new interactive features below.

// End Call
const btnEnd = document.getElementById('btn-end');
if(btnEnd) {
    btnEnd.addEventListener('click', () => {
        if(confirm("Are you sure you want to end this meeting?")) {
            // Go back to home screen
            meetingScreen.classList.remove('active');
            homeScreen.classList.add('active');
            
            // Reset states
            if(isSharingScreen) btnToggleShare.click();
        }
    });
}

// Modal Elements
const joinModal = document.getElementById('join-modal');
const scheduleModal = document.getElementById('schedule-modal');
const shareModal = document.getElementById('share-modal');
const loadingOverlay = document.getElementById('loading-overlay');

// 1. Join Flow
const btnHomeJoin = document.getElementById('btn-home-join');
if(btnHomeJoin) {
    btnHomeJoin.addEventListener('click', () => joinModal.classList.add('active'));
}
document.getElementById('btn-close-join').addEventListener('click', () => joinModal.classList.remove('active'));
document.getElementById('btn-submit-join').addEventListener('click', () => {
    joinModal.classList.remove('active');
    loadingOverlay.classList.add('active');
    setTimeout(() => {
        loadingOverlay.classList.remove('active');
        startMeeting();
    }, 1000);
});

// 2. Schedule Flow
const btnHomeSchedule = document.getElementById('btn-home-schedule');
if(btnHomeSchedule) {
    btnHomeSchedule.addEventListener('click', () => scheduleModal.classList.add('active'));
}
document.getElementById('btn-close-schedule').addEventListener('click', () => scheduleModal.classList.remove('active'));
document.getElementById('btn-submit-schedule').addEventListener('click', () => {
    const topic = document.getElementById('schedule-topic').value || 'New Meeting';
    const date = document.getElementById('schedule-date').value || 'Today';
    const time = document.getElementById('schedule-time').value || '14:00';
    
    // Create card
    const cardHTML = `
        <div class="meeting-card">
            <div class="mc-info">
                <span class="mc-time">${time} &middot; ${date}</span>
                <span class="mc-topic">${topic}</span>
                <span class="mc-id">Meeting ID: ${Math.floor(100 + Math.random() * 900)} ${Math.floor(100 + Math.random() * 900)} ${Math.floor(1000 + Math.random() * 9000)}</span>
            </div>
            <button class="btn-start-meeting" onclick="startMeeting()">Start</button>
        </div>
    `;
    
    const container = document.getElementById('meeting-cards-container');
    container.innerHTML += cardHTML;
    document.getElementById('upcoming-meetings').style.display = 'block';
    
    scheduleModal.classList.remove('active');
});

// 3. Direct Share Screen Flow
const btnHomeShare = document.getElementById('btn-home-share');
if(btnHomeShare) {
    btnHomeShare.addEventListener('click', () => shareModal.classList.add('active'));
}
document.getElementById('btn-close-share').addEventListener('click', () => shareModal.classList.remove('active'));
document.getElementById('btn-submit-share').addEventListener('click', () => {
    shareModal.classList.remove('active');
    loadingOverlay.classList.add('active');
    setTimeout(() => {
        loadingOverlay.classList.remove('active');
        startMeeting();
        // Automatically switch to share screen view
        if(!isSharingScreen) {
            document.getElementById('toggle-share-btn').click();
        }
    }, 1000);
});

const btnTopLink = document.getElementById('btn-top-link');
if(btnTopLink) {
    btnTopLink.addEventListener('click', () => {
        inviteModal.classList.add('active');
    });
}

const btnTopView = document.getElementById('btn-top-view');
if(btnTopView) {
    let isViewOn = false;
    btnTopView.addEventListener('click', () => {
        isViewOn = !isViewOn;
        if(isViewOn) {
            btnTopView.innerHTML = '<span class="material-symbols-rounded">visibility</span>';
        } else {
            btnTopView.innerHTML = '<span class="material-symbols-rounded">visibility_off</span>';
        }
    });
}

// === NEW MEETING ROOM FEATURES ===

// 1. Rename Feature
function renameUser() {
    const currentName = document.querySelector('.my-name-label').textContent.replace(' (You)', '').replace(' (Host, You)', '');
    const newName = prompt("Enter your new name:", currentName);
    if(newName && newName.trim() !== "") {
        const labels = document.querySelectorAll('.my-name-label');
        labels.forEach(label => {
            if(label.textContent.includes('Host, You')) {
                label.textContent = `${newName.trim()} (Host, You)`;
            } else if(label.textContent.includes('(You)')) {
                label.textContent = `${newName.trim()} (You)`;
            } else {
                label.textContent = newName.trim();
            }
        });
        
        // Also update the Home Screen name just to be complete
        const homeUserSpan = document.querySelector('.home-user span');
        if(homeUserSpan) homeUserSpan.textContent = newName.trim();
    }
}

// 2. Modals for Effects, Security, Breakout
const effectsModal = document.getElementById('effects-modal');
const securityModal = document.getElementById('security-modal');
const breakoutModal = document.getElementById('breakout-modal');

document.getElementById('btn-effects').addEventListener('click', () => effectsModal.classList.add('active'));
document.getElementById('btn-close-effects').addEventListener('click', () => effectsModal.classList.remove('active'));

document.getElementById('btn-security').addEventListener('click', () => securityModal.classList.add('active'));
document.getElementById('btn-close-security').addEventListener('click', () => securityModal.classList.remove('active'));

document.getElementById('btn-breakout').addEventListener('click', () => breakoutModal.classList.add('active'));
document.getElementById('btn-close-breakout').addEventListener('click', () => breakoutModal.classList.remove('active'));
document.getElementById('btn-submit-breakout').addEventListener('click', () => {
    breakoutModal.classList.remove('active');
    alert("Breakout Rooms assigned successfully.");
});

const settingsModal = document.getElementById('settings-modal');
document.getElementById('btn-top-settings').addEventListener('click', () => settingsModal.classList.add('active'));
document.getElementById('btn-close-settings').addEventListener('click', () => settingsModal.classList.remove('active'));

// 3. Quick Reactions
const btnReactions = document.getElementById('btn-reactions');
const reactionsPopover = document.getElementById('reactions-popover');

if (btnReactions && reactionsPopover) {
    btnReactions.addEventListener('click', (e) => {
        reactionsPopover.classList.toggle('active');
        e.stopPropagation();
    });

    // Close popover when clicking outside
    document.addEventListener('click', (e) => {
        if (!reactionsPopover.contains(e.target) && e.target !== btnReactions) {
            reactionsPopover.classList.remove('active');
        }
    });
}

window.sendReaction = function(emoji) {
    // Hide popover
    reactionsPopover.classList.remove('active');
    
    // Create floating emoji element
    const el = document.createElement('div');
    el.className = 'floating-emoji';
    el.textContent = emoji;
    
    // Randomize starting X position a bit around the center
    const randomX = Math.random() * 40 - 20; // -20 to 20
    el.style.left = `calc(50% + ${randomX}px)`;
    el.style.bottom = '80px';
    
    // For effect, put it inside the video grid so it floats up the screen
    const mainContent = document.getElementById('main-content');
    mainContent.appendChild(el);
    
    // Remove after animation completes
    setTimeout(() => {
        el.remove();
    }, 2000);
}

// 4. Whiteboard View Toggle
const btnWhiteboard = document.getElementById('btn-whiteboard');
const viewWhiteboard = document.getElementById('whiteboard-view');
let isWhiteboardOn = false;

if (btnWhiteboard && viewWhiteboard) {
    btnWhiteboard.addEventListener('click', () => {
        isWhiteboardOn = !isWhiteboardOn;
        if(isWhiteboardOn) {
            // Turn off share screen if on
            if(isSharingScreen) {
                document.getElementById('toggle-share-btn').click(); 
            }
            viewVideoGrid.classList.remove('active');
            viewShareScreen.classList.remove('active');
            
            // Show whiteboard block explicitly since we used style=display:none in HTML for safety
            viewWhiteboard.style.display = 'flex';
            viewWhiteboard.classList.add('active');
            
            btnWhiteboard.classList.add('active');
        } else {
            viewWhiteboard.style.display = 'none';
            viewWhiteboard.classList.remove('active');
            viewVideoGrid.classList.add('active');
            
            btnWhiteboard.classList.remove('active');
        }
    });
}

// 5. Chat Direct Messaging Sub-Tabs
window.switchChatTab = function(type) {
    const chatEveryone = document.getElementById('chat-everyone');
    const chatDirect = document.getElementById('chat-direct');
    const subTabs = document.querySelectorAll('.chat-sub-tabs .sub-tab');
    
    // Reset active classes
    subTabs.forEach(tab => tab.classList.remove('active'));
    
    if (type === 'everyone') {
        chatEveryone.style.display = 'flex';
        chatDirect.style.display = 'none';
        subTabs[0].classList.add('active'); // Assumes Everyone is first
    } else if (type === 'direct') {
        chatEveryone.style.display = 'none';
        chatDirect.style.display = 'flex';
        subTabs[1].classList.add('active');
    }
}

window.switchTab = function(tabName) {
    const chatContent = document.getElementById('tab-chat');
    const participantsContent = document.getElementById('tab-participants');
    const tabBtns = document.querySelectorAll('.tab-btn');
    
    tabBtns[0].classList.remove('active');
    tabBtns[1].classList.remove('active');
    
    if (tabName === 'chat') {
        chatContent.classList.add('active');
        participantsContent.classList.remove('active');
        tabBtns[0].classList.add('active');
    } else {
        chatContent.classList.remove('active');
        participantsContent.classList.add('active');
        tabBtns[1].classList.add('active');
    }
}

window.toggleSidePanel = function(tabName) {
    const sidePanel = document.getElementById('side-panel');
    
    // Toggle logic
    if (sidePanel.style.display === 'none') {
        sidePanel.style.display = 'flex';
    } else if (sidePanel.style.display === 'flex') {
        // If it's already open and we click the same button (like Chat to close Chat), close it
        sidePanel.style.display = 'none';
        return;
    } else {
        // Initial state (CSS driven, empty style.display)
        sidePanel.style.display = 'flex'; 
    }

    if (!isSharingScreen) {
        btnToggleShare.click(); 
    }
    switchTab(tabName);
}

const btnClosePanel = document.getElementById('btn-close-panel');
if(btnClosePanel) {
    btnClosePanel.addEventListener('click', () => {
        document.getElementById('side-panel').style.display = 'none';
    });
}

// 6. Change Virtual Background
function changeBackground(url) {
    const videoContainers = [
        document.getElementById('my-video-container'), // Normal view
        document.querySelector('.strip-item') // Strip view (for simplicity, we grab the parent container concept, but we actually just need the image)
    ];
    
    // Grab images specifically
    const myImg = document.getElementById('my-video-img');
    const stripImg = document.getElementById('my-strip-img');
    const listImg = document.getElementById('my-list-img');
    const homeImg = document.querySelector('.home-user img');
    
    // Ensure video is turned ON to see background
    const videoBtn = document.getElementById('btn-video');
    if(videoBtn.classList.contains('muted')) {
        videoBtn.click(); // Turn on video
    }
    
    if(url === 'none') {
        const defaultImg = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=120&q=80";
        if(myImg) myImg.src = defaultImg;
        if(stripImg) stripImg.src = defaultImg;
        if(listImg) listImg.src = defaultImg;
        if(homeImg) homeImg.src = defaultImg;
    } else {
        if(myImg) myImg.src = url;
        if(stripImg) stripImg.src = url;
        if(listImg) listImg.src = url;
        if(homeImg) homeImg.src = url;
    }
    
    effectsModal.classList.remove('active');
}

// 7. Tutorial (Onboarding) Slider Logic
const tutorialModal = document.getElementById('tutorial-modal');
const btnOpenTutorial = document.getElementById('btn-open-tutorial');
const btnNextTutorial = document.getElementById('btn-next-tutorial');
const btnSkipTutorial = document.getElementById('btn-skip-tutorial');
const slides = document.querySelectorAll('.tutorial-slide');
const dots = document.querySelectorAll('#ts-dots .dot');
let currentSlide = 0;

if (tutorialModal) {
    // Show tutorial on first load
    setTimeout(() => {
        tutorialModal.classList.add('active');
    }, 800);

    btnOpenTutorial.addEventListener('click', () => {
        currentSlide = 0;
        updateSlider();
        tutorialModal.classList.add('active');
    });

    btnSkipTutorial.addEventListener('click', () => {
        tutorialModal.classList.remove('active');
    });

    btnNextTutorial.addEventListener('click', () => {
        if (currentSlide < slides.length - 1) {
            currentSlide++;
            updateSlider();
        } else {
            tutorialModal.classList.remove('active'); // Finish
        }
    });
}

function updateSlider() {
    slides.forEach((slide, index) => {
        slide.style.display = (index === currentSlide) ? 'block' : 'none';
    });
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
    if (currentSlide === slides.length - 1) {
        btnNextTutorial.textContent = "Get Started";
    } else {
        btnNextTutorial.textContent = "Next";
    }
}

// 8. Live Captions (CC)
const btnCC = document.getElementById('btn-cc');
const captionsBox = document.getElementById('live-captions-box');
let isCCOn = false;

if (btnCC && captionsBox) {
    btnCC.addEventListener('click', () => {
        isCCOn = !isCCOn;
        if (isCCOn) {
            btnCC.classList.add('active');
            captionsBox.style.display = 'block';
        } else {
            btnCC.classList.remove('active');
            captionsBox.style.display = 'none';
        }
    });
}

// 9. Polling
const pollingModal = document.getElementById('polling-modal');
const btnPolling = document.getElementById('btn-polling');
const btnClosePolling = document.getElementById('btn-close-polling');
const btnLaunchPoll = document.getElementById('btn-launch-poll');

if (btnPolling && pollingModal) {
    btnPolling.addEventListener('click', () => pollingModal.classList.add('active'));
    btnClosePolling.addEventListener('click', () => pollingModal.classList.remove('active'));
    btnLaunchPoll.addEventListener('click', () => {
        pollingModal.classList.remove('active');
        alert("Poll launched successfully to all participants!");
    });
}

// 4. Media Toggles (Audio, Video, Record)
const btnMute = document.getElementById('btn-mute');
let isMuted = true; // Started muted based on UI (red icon)
btnMute.addEventListener('click', () => {
    isMuted = !isMuted;
    if(isMuted) {
        btnMute.classList.add('muted');
        btnMute.innerHTML = '<span class="material-symbols-rounded">mic_off</span>';
    } else {
        btnMute.classList.remove('muted');
        btnMute.innerHTML = '<span class="material-symbols-rounded">mic</span>';
    }
});

const btnVideo = document.getElementById('btn-video');
let isVideoOn = true;
btnVideo.addEventListener('click', () => {
    isVideoOn = !isVideoOn;
    const videoContainer = document.getElementById('my-video-container');
    if(isVideoOn) {
        btnVideo.classList.remove('muted');
        btnVideo.innerHTML = '<span class="material-symbols-rounded">videocam</span>';
        if(videoContainer) videoContainer.classList.remove('video-off');
    } else {
        btnVideo.classList.add('muted');
        btnVideo.innerHTML = '<span class="material-symbols-rounded">videocam_off</span>';
        if(videoContainer) videoContainer.classList.add('video-off');
    }
});

const btnRecord = document.getElementById('btn-record');
const recIndicator = document.getElementById('rec-indicator');
let isRecording = false;
btnRecord.addEventListener('click', () => {
    isRecording = !isRecording;
    if(isRecording) {
        btnRecord.style.color = 'var(--accent-red)';
        recIndicator.style.display = 'flex';
        // Add flashing effect
        recIndicator.style.animation = 'fadeInOut 1s infinite alternate';
    } else {
        btnRecord.style.color = 'white';
        recIndicator.style.display = 'none';
        recIndicator.style.animation = 'none';
    }
});

// Add blinking animation for REC dynamically
const style = document.createElement('style');
style.innerHTML = `@keyframes fadeInOut { from { opacity: 0.5; } to { opacity: 1; } }`;
document.head.appendChild(style);

setInterval(updateClock, 1000);
updateClock(); // Initial call
