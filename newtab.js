const video = document.getElementById('video-bg');
const img = document.getElementById('image-bg');
const upload = document.getElementById('upload');
const timeDisplay = document.getElementById('time');

function updateClock() {
    const now = new Date();
    timeDisplay.innerText = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
setInterval(updateClock, 1000);
updateClock();

upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const data = event.target.result;
        saveToDB(data, file.type);
        displayMedia(data, file.type);
    };
    reader.readAsDataURL(file);
});

function displayMedia(data, type) {
    if (type.includes('video')) {
        img.style.display = 'none';
        video.style.display = 'block';
        video.src = data;
        video.muted = false;
        video.play().catch(err => {
            video.muted = true;
            video.play();
        });
    } else {
        video.style.display = 'none';
        img.style.display = 'block';
        img.style.backgroundImage = `url(${data})`;
        img.style.backgroundSize = 'cover';
        img.style.backgroundPosition = 'center';
    }
}

function saveToDB(data, type) {
    const request = indexedDB.open("EronDB", 1);
    request.onupgradeneeded = (e) => e.target.result.createObjectStore("wallpapers");
    request.onsuccess = (e) => {
        const db = e.target.result;
        db.transaction("wallpapers", "readwrite").objectStore("wallpapers").put({ data, type }, "current");
    };
}

function loadWallpaper() {
    const request = indexedDB.open("EronDB", 1);
    request.onupgradeneeded = (e) => e.target.result.createObjectStore("wallpapers");
    request.onsuccess = (e) => {
        const db = e.target.result;
        const getReq = db.transaction("wallpapers").objectStore("wallpapers").get("current");
        getReq.onsuccess = () => {
            if (getReq.result) displayMedia(getReq.result.data, getReq.result.type);
        };
    };
}

document.body.addEventListener('click', () => {
    if (video.src && video.muted) {
        video.muted = false;
        video.play();
    }
}, { once: true });

loadWallpaper();
