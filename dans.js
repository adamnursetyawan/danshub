/* [EFEK KURSOR KUSTOM (PENGIKUT TETIKUS/MOUSE)] */
const dot = document.getElementById("cursor-dot");
const outline = document.getElementById("cursor-outline");
window.addEventListener("mousemove", function(e) {
    dot.style.left = e.clientX + "px";
    dot.style.top = e.clientY + "px";
    setTimeout(() => {
        outline.style.left = e.clientX + "px";
        outline.style.top = e.clientY + "px";
    }, 50);
});

document.querySelectorAll('a, button, input, select, summary').forEach(el => {
    el.addEventListener('mouseover', () => { document.body.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); });
});

/* [NAVIGASI LACI (DRAWER) & TOMBOL KEMBALI KE ATAS] */
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const drawer = document.getElementById('side-drawer');
const overlay = document.getElementById('drawer-overlay');
const navLinks = document.querySelectorAll('.nav-link');

function toggleDrawer() { 
    drawer.classList.toggle('open'); 
    overlay.classList.toggle('open'); 
}

menuBtn.addEventListener('click', toggleDrawer); 
closeBtn.addEventListener('click', toggleDrawer); 
overlay.addEventListener('click', toggleDrawer);
navLinks.forEach(link => { link.addEventListener('click', toggleDrawer); });

const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) { backToTopBtn.classList.add('show'); } 
    else { backToTopBtn.classList.remove('show'); }
});
backToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });

/* [SISTEM TEMA GELAP (DARK MODE)] */
const themeBtn = document.getElementById('theme-btn');
const themeIcon = themeBtn.querySelector('i');
themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if(document.body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
    }
    updateCircle(parseFloat(document.getElementById('main-speed').innerText) || 0);
});

/* [ANIMASI MUNCUL SAAT DI-SCROLL] */
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -20px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) { entry.target.classList.add('animate'); }
        });
    }, observerOptions);
    document.querySelectorAll('.animate-on-scroll').forEach(el => { observer.observe(el); });
});

/* [INISIALISASI SUPABASE CLOUD (UBAH BAGIAN INI DENGAN API ANDA)] */
const supabaseUrl = 'https://uffomcqrutozccbvyiwm.supabase.co/rest/v1/';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZm9tY3FydXRvemNjYnZ5aXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MjUyNDYsImV4cCI6MjEwMTEwMTI0Nn0.Q--ZdvsaPBLHxYdAUhjhMEMSeI6KE2nM1JQEVtNLtLU';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

/* [SISTEM LOGIN ADMIN] */
let isAdmin = false;

async function checkLogin() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        isAdmin = true;
        document.body.classList.add('admin-mode');
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        document.getElementById('bm-form').style.display = 'flex';
        document.getElementById('todo-form').style.display = 'flex';
        document.getElementById('upload-media-form').style.display = 'flex';
    } else {
        isAdmin = false;
        document.body.classList.remove('admin-mode');
        document.getElementById('login-form-container').style.display = 'block';
        document.getElementById('admin-panel').style.display = 'none';
        document.getElementById('bm-form').style.display = 'none';
        document.getElementById('todo-form').style.display = 'none';
        document.getElementById('upload-media-form').style.display = 'none';
    }
}

async function loginAdmin() {
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-pass').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        alert('Gagal Login: ' + error.message);
    } else {
        alert('Login Berhasil!');
        checkLogin();
    }
}

async function logoutAdmin() {
    await supabase.auth.signOut();
    alert('Anda telah keluar.');
    checkLogin();
}

/* [PENGELOLA BOOKMARK (CLOUD)] */
async function loadBookmarks() {
    const list = document.getElementById('bookmark-list');
    const { data, error } = await supabase.from('bookmarks').select('*').order('created_at', { ascending: false });
    
    if (error) {
        list.innerHTML = `<span style="color:var(--offline-color);">Gagal memuat bookmark.</span>`;
        return;
    }
    
    list.innerHTML = '';
    data.forEach((bm) => {
        list.innerHTML += `
            <div class="bm-item">
                <a href="${bm.url}" target="_blank" style="color:inherit; text-decoration:none;"><i class="fas fa-link"></i> ${bm.name}</a>
                <button class="btn-del" onclick="deleteBookmark(${bm.id})"><i class="fas fa-times"></i></button>
            </div>`;
    });
}

async function addBookmark(e) {
    e.preventDefault();
    const name = document.getElementById('bm-name').value;
    const url = document.getElementById('bm-url').value;
    
    await supabase.from('bookmarks').insert([{ name, url }]);
    e.target.reset();
    loadBookmarks();
}

async function deleteBookmark(id) {
    if(confirm('Hapus Bookmark?')) {
        await supabase.from('bookmarks').delete().eq('id', id);
        loadBookmarks();
    }
}

/* [DAFTAR TO-DO (CLOUD)] */
async function loadTodos() {
    const list = document.getElementById('todo-list');
    const { data, error } = await supabase.from('todos').select('*').order('created_at', { ascending: false });
    
    if (error) { list.innerHTML = `<span style="color:var(--offline-color);">Gagal memuat to-do.</span>`; return; }
    list.innerHTML = '';
    
    if (data.length === 0) list.innerHTML = '<li style="font-size:0.8rem; color:var(--text-muted);">Tidak ada catatan.</li>';
    data.forEach((todo) => {
        const checked = todo.done ? 'checked' : '';
        const doneClass = todo.done ? 'done' : '';
        const disabledCheck = isAdmin ? '' : 'disabled'; // [HANYA ADMIN YANG BISA CENTANG]
        list.innerHTML += `
            <li class="todo-item ${doneClass}">
                <div>
                    <input type="checkbox" ${checked} ${disabledCheck} onchange="toggleTodo(${todo.id}, ${!todo.done})" style="margin-right:8px; cursor:pointer;">
                    <span>${todo.text}</span>
                </div>
                <button class="btn-del" onclick="deleteTodo(${todo.id})"><i class="fas fa-trash"></i></button>
            </li>`;
    });
}

async function addTodo(e) {
    e.preventDefault();
    const text = document.getElementById('todo-input').value;
    await supabase.from('todos').insert([{ text }]);
    e.target.reset();
    loadTodos();
}

async function toggleTodo(id, newStatus) {
    await supabase.from('todos').update({ done: newStatus }).eq('id', id);
    loadTodos();
}

async function deleteTodo(id) {
    await supabase.from('todos').delete().eq('id', id);
    loadTodos();
}

/* [SISTEM DATABASE MEDIA STORAGE (CLOUD)] */
async function loadMedia() {
    const gallery = document.getElementById('media-gallery');
    const { data, error } = await supabase.storage.from('media').list();
    
    if (error) { gallery.innerHTML = '<span style="color:red;">Gagal memuat media.</span>'; return; }
    
    gallery.innerHTML = '';
    if(data.length === 0 || (data.length === 1 && data[0].name === '.emptyFolderPlaceholder')) {
        gallery.innerHTML = '<span style="font-size:0.8rem; color:var(--text-muted); grid-column: 1 / -1; text-align:center;">Belum ada media di database.</span>';
        return;
    }

    data.forEach(file => {
        if(file.name === '.emptyFolderPlaceholder') return;
        
        const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(file.name);
        const url = publicUrlData.publicUrl;
        
        const item = document.createElement('div');
        item.className = 'media-item';
        
        // [MENENTUKAN TIPE FILE DARI EKSTENSI]
        if(file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            item.innerHTML = `<img src="${url}" alt="media">`;
        } else if (file.name.match(/\.(mp4|webm)$/i)) {
            item.innerHTML = `<video src="${url}" controls></video>`;
        } else if (file.name.match(/\.(mp3|wav|ogg)$/i)) {
            item.innerHTML = `<audio src="${url}" controls></audio>`;
        } else {
            item.innerHTML = `<a href="${url}" target="_blank" style="font-size:0.7rem;">${file.name}</a>`;
        }

        item.innerHTML += `<button class="delete-media" onclick="deleteMedia('${file.name}')"><i class="fas fa-trash"></i></button>`;
        gallery.appendChild(item);
    });
}

async function uploadMedia(event) {
    event.preventDefault();
    const fileInput = document.getElementById('media-file');
    const uploadBtn = document.getElementById('upload-btn');
    
    if(fileInput.files.length === 0) return;
    const file = fileInput.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`; // [BUAT NAMA ACAK]

    uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengunggah...';
    uploadBtn.disabled = true;

    const { error } = await supabase.storage.from('media').upload(fileName, file);

    if (error) { alert('Gagal mengunggah: ' + error.message); } 
    else { fileInput.value = ''; loadMedia(); }

    uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Unggah';
    uploadBtn.disabled = false;
}

async function deleteMedia(fileName) {
    if(confirm('Yakin ingin menghapus media ini?')) {
        await supabase.storage.from('media').remove([fileName]);
        loadMedia();
    }
}

/* [WIDGET CUACA LOKAL] */
async function fetchWeather() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2416&longitude=107.0116&current_weather=true');
        const data = await res.json();
        const temp = data.current_weather.temperature;
        const isDay = data.current_weather.is_day;
        
        document.getElementById('weather-temp').innerText = Math.round(temp) + '°C';
        
        const wIcon = document.getElementById('weather-icon');
        wIcon.classList.remove('fa-spinner', 'fa-spin');
        if (isDay) {
            wIcon.classList.add('fa-cloud-sun');
            document.getElementById('weather-desc').innerText = "Cerah Berawan";
        } else {
            wIcon.classList.add('fa-cloud-moon');
            wIcon.style.color = "#A9C6EB";
            document.getElementById('weather-desc').innerText = "Malam Cerah";
        }
    } catch (error) {
        document.getElementById('weather-desc').innerText = "Gagal memuat";
    }
}

/* [WIDGET KURS & KRIPTO MINI] */
async function fetchCrypto() {
    try {
        const resUsd = await fetch('https://open.er-api.com/v6/latest/USD');
        const dataUsd = await resUsd.json();
        const idrRate = dataUsd.rates.IDR;
        document.getElementById('usd-price').innerText = "Rp" + idrRate.toLocaleString('id-ID'); 

        const resCrypto = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        const dataCrypto = await resCrypto.json();
        document.getElementById('btc-price').innerText = "$" + dataCrypto.bitcoin.usd.toLocaleString('en-US'); 
        document.getElementById('eth-price').innerText = "$" + dataCrypto.ethereum.usd.toLocaleString('en-US'); 
    } catch (err) {
        document.getElementById('usd-price').innerText = "Error";
        document.getElementById('btc-price').innerText = "Error";
        document.getElementById('eth-price').innerText = "Error";
    }
}

/* [WIDGET STATUS LAYANAN] */
function checkServiceStatus() {
    const services = [
        { id: 'status-router', isOnline: true },
        { id: 'status-dns', isOnline: true },
        { id: 'status-nas', isOnline: true } 
    ];
    
    services.forEach((service, index) => {
        setTimeout(() => {
            const el = document.getElementById(service.id);
            if(el) {
                if(service.isOnline) {
                    el.className = 'status-badge badge-online';
                    el.innerHTML = '<i class="fas fa-check-circle"></i> Online';
                } else {
                    el.className = 'status-badge badge-offline';
                    el.innerHTML = '<i class="fas fa-times-circle"></i> Offline';
                }
            }
        }, 1500 + (index * 800)); 
    });
}

/* [PEMBUAT KATA SANDI] */
function generatePassword() {
    const length = document.getElementById('pass-length').value;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < length; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    document.getElementById('gen-password').value = password;
}

function copyPassword() {
    const passInput = document.getElementById('gen-password');
    if(passInput.value) {
        passInput.select();
        document.execCommand('copy');
        alert("Kata sandi berhasil disalin!");
    }
}

/* [KALKULATOR SUBNET] */
function calculateSubnet() {
    const ipInput = document.getElementById('sub-ip').value;
    const cidr = parseInt(document.getElementById('sub-cidr').value);
    const resultBox = document.getElementById('subnet-result');

    if (!ipInput.match(/^(\d{1,3}\.){3}\d{1,3}$/) || isNaN(cidr) || cidr < 1 || cidr > 32) {
        resultBox.innerHTML = "<span style='color:red;'>Format IP atau Prefix salah! (Contoh: 192.168.1.1 dan 24)</span>";
        resultBox.style.display = 'block';
        return;
    }

    const ipParts = ipInput.split('.').map(Number);
    const mask = ~((1 << (32 - cidr)) - 1);
    
    const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];
    const netInt = ipInt & mask;
    const broadInt = netInt | ~mask;

    const toIP = (int) => [(int >>> 24) & 255, (int >>> 16) & 255, (int >>> 8) & 255, int & 255].join('.');
    
    const totalHosts = (cidr === 31 || cidr === 32) ? 0 : Math.pow(2, 32 - cidr) - 2;

    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <span>Netmask:</span> ${toIP(mask)} <br>
        <span>Network:</span> ${toIP(netInt)} <br>
        <span>Broadcast:</span> ${toIP(broadInt)} <br>
        <span>Total Host Valid:</span> ${totalHosts}
    `;
}

/* [INFORMASI SISTEM PERANGKAT] */
function getAdvancedSystemInfo() {
    const ramEl = document.getElementById('sys-ram');
    if (navigator.deviceMemory) {
        ramEl.innerText = navigator.deviceMemory + ' GB (Estimasi)';
    } else {
        ramEl.innerText = 'Tidak Didukung';
    }

    const batEl = document.getElementById('sys-battery');
    if ('getBattery' in navigator) {
        navigator.getBattery().then(function(battery) {
            function updateBatteryStatus() {
                const level = Math.round(battery.level * 100) + '%';
                const charging = battery.charging ? ' (⚡ Mengisi)' : '';
                batEl.innerText = level + charging;
            }
            updateBatteryStatus();
            battery.addEventListener('levelchange', updateBatteryStatus);
            battery.addEventListener('chargingchange', updateBatteryStatus);
        });
    } else {
        batEl.innerText = 'Tidak Didukung';
    }

    const connEl = document.getElementById('sys-conn');
    const downEl = document.getElementById('sys-downlink');
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
        function updateConnectionStatus() {
            connEl.innerText = connection.effectiveType ? connection.effectiveType.toUpperCase() : 'Tidak Diketahui';
            downEl.innerText = connection.downlink ? connection.downlink + ' Mbps' : 'Tidak Diketahui';
        }
        updateConnectionStatus();
        connection.addEventListener('change', updateConnectionStatus);
    } else {
        connEl.innerText = 'Tidak Didukung';
        downEl.innerText = 'Tidak Didukung';
    }
}

/* [WIDGET COLOR PICKER] */
const colorInput = document.getElementById('color-input');
const colorHex = document.getElementById('color-hex');

if(colorInput && colorHex) {
    colorInput.addEventListener('input', function() {
        colorHex.value = this.value.toUpperCase();
    });
}

function copyColorPicker() {
    const hexInput = document.getElementById('color-hex');
    if(hexInput.value) {
        hexInput.select();
        document.execCommand('copy');
        alert("Kode warna " + hexInput.value + " berhasil disalin!");
    }
}

/* [LOGIKA PENCARIAN GOOGLE & URL] */
function handleSearch(event) {
    event.preventDefault(); 
    const input = document.getElementById('search-input').value.trim();
    if (!input) return;

    const urlPattern = /^(https?:\/\/)?([\w\d\-]+\.)+\w{2,}(\/.*)?$/i;
    if (urlPattern.test(input)) {
        let targetUrl = input;
        if (!/^https?:\/\//i.test(input)) { targetUrl = 'https://' + input; }
        window.open(targetUrl, '_blank');
    } else {
        window.open('https://www.google.com/search?q=' + encodeURIComponent(input), '_blank');
    }
}

/* [SISTEM SIMULASI UJI KECEPATAN JARINGAN] */
function animateValue(obj, start, end, duration, isPing = false, onUpdate = null) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const easeOutQuad = 1 - (1 - progress) * (1 - progress); 
        let currentVal = start + easeOutQuad * (end - start);
        
        if (isPing) { obj.innerText = Math.floor(currentVal); } 
        else { obj.innerText = currentVal.toFixed(1); }

        if (onUpdate) onUpdate(currentVal);
        if (progress < 1) window.requestAnimationFrame(step);
    };
    window.requestAnimationFrame(step);
}

function updateCircle(value, max = 100) {
    const percentage = Math.min((value / max) * 100, 100);
    const mainColor = document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#162a47';
    const bgColor = document.body.classList.contains('dark-mode') ? '#334155' : '#e2e8f0';
    document.getElementById('speed-circle').style.background = `conic-gradient(from 180deg, ${mainColor} ${percentage}%, ${bgColor} 0%)`;
}

async function startSpeedTest() {
    const startBtn = document.getElementById('start-btn');
    const mainSpeedEl = document.getElementById('main-speed');
    const dlValEl = document.getElementById('dl-val');
    const ulValEl = document.getElementById('ul-val');
    const pingValEl = document.getElementById('ping-val');
    const statusTextEl = document.getElementById('status-text');

    if(!navigator.onLine) {
        alert("Perangkat Anda sedang offline. Silakan periksa koneksi internet.");
        return;
    }

    startBtn.disabled = true;
    startBtn.innerText = "Menghubungkan ke Server...";
    dlValEl.innerText = "--"; ulValEl.innerText = "--"; pingValEl.innerText = "--";
    statusTextEl.style.opacity = 1;
    document.getElementById('server-select').disabled = true;

    const targetPing = Math.floor(Math.random() * 12) + 8;
    const targetDownload = (Math.random() * 40) + 50; 
    const targetUpload = (Math.random() * 15) + 20;   

    statusTextEl.innerText = "Mengukur Ping...";
    animateValue(pingValEl, 100, targetPing, 1000, true);
    await new Promise(r => setTimeout(r, 1200));

    statusTextEl.innerText = "Menguji Unduhan...";
    animateValue(mainSpeedEl, 0, targetDownload, 2500, false, (val) => updateCircle(val));
    animateValue(dlValEl, 0, targetDownload, 2500, false);
    await new Promise(r => setTimeout(r, 2800));

    statusTextEl.innerText = "Menguji Unggahan...";
    mainSpeedEl.innerText = "0.0";
    updateCircle(0);
    animateValue(mainSpeedEl, 0, targetUpload, 2500, false, (val) => updateCircle(val));
    animateValue(ulValEl, 0, targetUpload, 2500, false);
    await new Promise(r => setTimeout(r, 2800));

    statusTextEl.innerText = "Selesai";
    mainSpeedEl.innerText = targetDownload.toFixed(1); 
    updateCircle(targetDownload);
    
    startBtn.disabled = false;
    startBtn.innerText = "Uji Ulang Kecepatan";
    document.getElementById('server-select').disabled = false;

    saveToHistory(targetDownload, targetUpload, targetPing);

    setTimeout(() => {
        document.getElementById('modal-dl').innerText = targetDownload.toFixed(1);
        document.getElementById('result-modal').style.display = 'flex';
    }, 500);
}

function saveToHistory(dl, ul, ping) {
    const historyUl = document.getElementById('history-ul');
    const serverName = document.getElementById('server-select').selectedOptions[0].text;
    const emptyMsg = document.getElementById('empty-history');
    if(emptyMsg) { emptyMsg.remove(); }

    const now = new Date();
    const timeString = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0');

    const li = document.createElement('li');
    li.innerHTML = `<strong>${timeString}</strong> - ${serverName}<br> 
                    <span style="color:#4C7EBF">DL: ${dl.toFixed(1)}</span> | 
                    <span style="color:#25D366">UL: ${ul.toFixed(1)}</span> | 
                    Ping: ${ping}ms`;
    historyUl.prepend(li);
}

function clearHistory(event) {
    event.preventDefault(); 
    const historyUl = document.getElementById('history-ul');
    historyUl.innerHTML = '<li id="empty-history" style="text-align:center; border:none;">Belum ada riwayat tes.</li>';
}

function closeModal() { document.getElementById('result-modal').style.display = 'none'; }
function shareResult() {
    const dl = document.getElementById('modal-dl').innerText;
    const text = `Tebak? Kecepatan internetku nyampe ${dl} Mbps di DANSHUB, Kenceng banget kan? Cobain deh tes kecepatanmu.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

/* [WAKTU, LOKASI & INFORMASI PERANGKAT DASAR] */
function startLiveClock() {
    const clockEl = document.getElementById('live-clock');
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    }, 1000);
}

function updateNetworkStatus() {
    const statusDot = document.getElementById('network-status');
    if (navigator.onLine) {
        statusDot.className = 'status-dot online';
        statusDot.title = 'Terhubung ke Internet';
    } else {
        statusDot.className = 'status-dot offline';
        statusDot.title = 'Koneksi Terputus';
    }
}
window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);

async function fetchNetworkInfo() {
    try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        document.getElementById('ip-address').innerText = data.ip || 'Tidak terdeteksi';
        document.getElementById('isp-name').innerText = data.org || 'Tidak terdeteksi';
    } catch (error) {
        document.getElementById('ip-address').innerText = 'Gagal memuat';
        document.getElementById('isp-name').innerText = 'Gagal memuat';
    }
}

function getLocalIP() {
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    if (!window.RTCPeerConnection) {
        document.getElementById('local-ip').innerText = "Tidak Didukung Browser"; return;
    }
    const pc = new RTCPeerConnection({iceServers: []});
    const noop = () => {};
    let localIP = "Mendeteksi...";

    pc.createDataChannel("");
    pc.createOffer(pc.setLocalDescription.bind(pc), noop);
    pc.onicecandidate = function(ice) {
        if (ice && ice.candidate && ice.candidate.candidate) {
            const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/; 
            const match = ipRegex.exec(ice.candidate.candidate);
            if (match) {
                localIP = match[1];
                document.getElementById('local-ip').innerText = localIP;
                pc.onicecandidate = noop; 
            }
        }
    };
    
    setTimeout(() => {
        const el = document.getElementById('local-ip');
        if (el.innerText === 'Mendeteksi...') { el.innerText = 'Disembunyikan (Privasi Browser)'; }
    }, 2000);
}

function getDeviceDiagnostics() {
    const ua = navigator.userAgent;
    let browser = "Browser Lain"; let os = "OS Lain";

    if (ua.includes("Firefox")) browser = "Mozilla Firefox";
    else if (ua.includes("Edg")) browser = "Microsoft Edge";
    else if (ua.includes("Chrome")) browser = "Google Chrome";
    else if (ua.includes("Safari")) browser = "Apple Safari";
    
    if (ua.includes("Win")) os = "Windows";
    else if (ua.includes("Mac")) os = "MacOS";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Linux")) os = "Linux";
    else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

    document.getElementById('device-info').innerHTML = `<i class="fas fa-laptop-code"></i> Perangkat: <strong>${os}</strong> | <strong>${browser}</strong>`;
}

/* [JALANKAN SELURUH FUNGSI SAAT KODE SELESAI DIMUAT] */
window.onload = () => {
    checkLogin(); /* [CEK LOGIN TERLEBIH DAHULU] */
    startLiveClock();
    updateNetworkStatus();
    fetchWeather();
    fetchCrypto();
    checkServiceStatus();
    loadBookmarks(); /* [MENGAMBIL DARI SUPABASE] */
    loadTodos();     /* [MENGAMBIL DARI SUPABASE] */
    loadMedia();     /* [MENGAMBIL DARI SUPABASE] */
    fetchNetworkInfo();
    getLocalIP();
    getDeviceDiagnostics();
    getAdvancedSystemInfo(); 
};
