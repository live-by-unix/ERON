const video = document.getElementById('video-bg');
const img = document.getElementById('image-bg');
const upload = document.getElementById('upload');
const timeDisplay = document.getElementById('time');
const audioNotice = document.getElementById('audio-notice');

function updateClock() {
    const now = new Date();
    timeDisplay.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    saveToDB(file);
});

function displayMedia(fileBlob) {
    const url = URL.createObjectURL(fileBlob);
    if (fileBlob.type.includes('video')) {
        img.style.display = 'none';
        video.style.display = 'block';
        video.src = url;
        video.muted = true;
        video.play();
    } else {
        video.style.display = 'none';
        img.style.display = 'block';
        img.style.backgroundImage = `url(${url})`;
        audioNotice.style.display = 'none';
    }
}

function saveToDB(file) {
    const request = indexedDB.open("EronDB", 1);
    request.onupgradeneeded = (e) => e.target.result.createObjectStore("wallpapers");
    request.onsuccess = (e) => {
        const db = e.target.result;
        db.transaction("wallpapers", "readwrite").objectStore("wallpapers").put(file, "current");
        displayMedia(file);
    };
}

function loadWallpaper() {
    const request = indexedDB.open("EronDB", 1);
    request.onupgradeneeded = (e) => e.target.result.createObjectStore("wallpapers");
    request.onsuccess = (e) => {
        const db = e.target.result;
        const getReq = db.transaction("wallpapers").objectStore("wallpapers").get("current");
        getReq.onsuccess = () => {
            if (getReq.result) displayMedia(getReq.result);
        };
    };
}

window.addEventListener('click', () => {
    if (video.style.display === 'block') {
        video.muted = false;
        video.play();
        audioNotice.style.display = 'none';
    }
});

loadWallpaper();
