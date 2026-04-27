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

function displayMedia(fileBlob) {
    const url = URL.createObjectURL(fileBlob);
    if (fileBlob.type.includes('video')) {
        img.style.display = 'none';
        video.style.display = 'block';
        video.src = url;
        video.muted = true;
        video.play().catch(() => {
            audioNotice.style.display = 'block';
        });
    } else {
        video.style.display = 'none';
        img.style.display = 'block';
        img.style.backgroundImage = `url(${url})`;
        audioNotice.style.display = 'none';
    }
}

function getDB() {
    return new Promise((resolve) => {
        const request = indexedDB.open("EronDB", 1);
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains("wallpapers")) {
                db.createObjectStore("wallpapers");
            }
        };
        request.onsuccess = (e) => resolve(e.target.result);
    });
}

upload.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const db = await getDB();
    const tx = db.transaction("wallpapers", "readwrite");
    tx.objectStore("wallpapers").put(file, "current");
    tx.oncomplete = () => displayMedia(file);
});

async function loadWallpaper() {
    const db = await getDB();
    const tx = db.transaction("wallpapers", "readonly");
    const getReq = tx.objectStore("wallpapers").get("current");
    getReq.onsuccess = () => {
        if (getReq.result) displayMedia(getReq.result);
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
