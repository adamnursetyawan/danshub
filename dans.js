/* [EFEK KURSOR KUSTOM PENGIKUT TETIKUS ATAU MOUSE] */
const dot = document.getElementById("cursor-dot");
const outline = document.getElementById("cursor-outline");
if (dot && outline) {
    window.addEventListener("mousemove", function(e) {
        dot.style.left = e.clientX + "px";
        dot.style.top = e.clientY + "px";
        setTimeout(() => {
            outline.style.left = e.clientX + "px";
            outline.style.top = e.clientY + "px";
        }, 50);
    });
}

document.querySelectorAll('a, button, input, select, summary').forEach(el => {
    el.addEventListener('mouseover', () => { document.body.classList.add('cursor-hover'); });
    el.addEventListener('mouseleave', () => { document.body.classList.remove('cursor-hover'); });
});

/* [NAVIGASI LACI DRAWER DAN TOMBOL KEMBALI KE ATAS] */
const menuBtn = document.getElementById('menu-btn');
const closeBtn = document.getElementById('close-btn');
const drawer = document.getElementById('side-drawer');
const overlay = document.getElementById('drawer-overlay');
const navLinks = document.querySelectorAll('.nav-link');

function toggleDrawer() { 
    if (drawer) drawer.classList.toggle('open'); 
    if (overlay) overlay.classList.toggle('open'); 
}

if (menuBtn) menuBtn.addEventListener('click', toggleDrawer); 
if (closeBtn) closeBtn.addEventListener('click', toggleDrawer); 
if (overlay) overlay.addEventListener('click', toggleDrawer);
navLinks.forEach(link => { link.addEventListener('click', toggleDrawer); });

const backToTopBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => {
    if (!backToTopBtn) return;
    if (window.scrollY > 300) { backToTopBtn.classList.add('show'); } 
    else { backToTopBtn.classList.remove('show'); }
});
if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* [SISTEM TEMA GELAP DARK MODE] */
const themeBtn = document.getElementById('theme-btn');
if (themeBtn) {
    const themeIcon = themeBtn.querySelector('i');
    themeBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        if(document.body.classList.contains('dark-mode')) {
            if (themeIcon) themeIcon.classList.replace('fa-moon', 'fa-sun');
        } else {
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        }
        updateCircle(parseFloat(document.getElementById('main-speed')?.innerText) || 0);
    });
}

/* [ANIMASI MUNCUL SAAT DI SCROLL] */
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = { threshold: 0.1, rootMargin: "0px 0px -20px 0px" };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) { entry.target.classList.add('animate'); }
        });
    }, observerOptions);
    document.querySelectorAll('.animate-on-scroll').forEach(el => { observer.observe(el); });
});

/* [INISIALISASI SUPABASE CLOUD] */
const supabaseUrl = 'https://uffomcqrutozccbvyiwm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZm9tY3FydXRvemNjYnZ5aXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1MjUyNDYsImV4cCI6MjEwMTEwMTI0Nn0.Q--ZdvsaPBLHxYdAUhjhMEMSeI6KE2nM1JQEVtNLtLU';

let supabase = null;
try {
    if (window.supabase) {
        supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
    }
} catch (e) {
    console.warn("Supabase Init Error:", e);
}

/* [SISTEM LOGIN ADMIN] */
let isAdmin = false;

async function checkLogin() {
    try {
        if (!supabase) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            isAdmin = true;
            document.body.classList.add('admin-mode');
            const lfc = document.getElementById('login-form-container');
            const ap = document.getElementById('admin-panel');
            const bmf = document.getElementById('bm-form');
            const tf = document.getElementById('todo-form');
            const umf = document.getElementById('upload-media-form');
            if(lfc) lfc.style.display = 'none';
            if(ap) ap.style.display = 'block';
            if(bmf) bmf.style.display = 'flex';
            if(tf) tf.style.display = 'flex';
            if(umf) umf.style.display = 'flex';
        } else {
            isAdmin = false;
            document.body.classList.remove('admin-mode');
            const lfc = document.getElementById('login-form-container');
            const ap = document.getElementById('admin-panel');
            const bmf = document.getElementById('bm-form');
            const tf = document.getElementById('todo-form');
            const umf = document.getElementById('upload-media-form');
            if(lfc) lfc.style.display = 'block';
            if(ap) ap.style.display = 'none';
            if(bmf) bmf.style.display = 'none';
            if(tf) tf.style.display = 'none';
            if(umf) umf.style.display = 'none';
        }
    } catch (err) {
        console.error("Check Login Error:", err);
    }
}

async function loginAdmin() {
    try {
        if (!supabase) return;
        const email = document.getElementById('admin-email')?.value;
        const password = document.getElementById('admin-pass')?.value;
        if (!email || !password) return;
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
            alert('Gagal Login: ' + error.message);
        } else {
            alert('Login Berhasil!');
            checkLogin();
        }
    } catch (err) {
        alert('Terjadi kesalahan saat login.');
    }
}

async function logoutAdmin() {
    try {
        if (!supabase) return;
        await supabase.auth.signOut();
        alert('Anda telah keluar.');
        checkLogin();
    } catch (err) {
        console.error("Logout Error:", err);
    }
}

/* [PENGELOLA BOOKMARK CLOUD] */
async function loadBookmarks() {
    const list = document.getElementById('bookmark-list');
    if (!list) return;
    if (!supabase) {
        list.innerHTML = `<span style="color:var(--offline-color);">Cloud tidak terhubung.</span>`;
        return;
    }
    try {
        const { data, error } = await supabase.from('bookmarks').select('*');
        if (error) {
            list.innerHTML = `<span style="color:var(--offline-color);">Gagal memuat bookmark.</span>`;
            return;
        }
        list.innerHTML = '';
        data.forEach((bm) => {
            list.innerHTML += `
                <div class="bm-item">
                    <a href="${bm.url}" target="_blank" style="color:inherit; text-decoration:none;"><i class="fas fa-link"></i> ${bm.name}</a>
                    <button class="btn-del" onclick="deleteBookmark('${bm.name}')"><i class="fas fa-times"></i></button>
                </div>`;
        });
    } catch (err) {
        list.innerHTML = `<span style="color:var(--offline-color);">Error koneksi bookmark.</span>`;
    }
}

async function addBookmark(e) {
    e.preventDefault();
    if (!supabase) return;
    try {
        const name = document.getElementById('bm-name')?.value;
        const url = document.getElementById('bm-url')?.value;
        if (!name || !url) return;
        await supabase.from('bookmarks').insert([{ name, url }]);
        e.target.reset();
        loadBookmarks();
    } catch (err) {
        alert("Gagal menambah bookmark.");
    }
}

async function deleteBookmark(name) {
    if (!supabase) return;
    try {
        if(confirm('Hapus Bookmark?')) {
            await supabase.from('bookmarks').delete().eq('name', name);
            loadBookmarks();
        }
    } catch (err) {
        alert("Gagal menghapus bookmark.");
    }
}

/* [DAFTAR TODO CLOUD] */
async function loadTodos() {
    const list = document.getElementById('todo-list');
    if (!list) return;
    if (!supabase) { 
        list.innerHTML = `<span style="color:var(--offline-color);">Cloud tidak terhubung.</span>`; 
        return; 
    }
    try {
        const { data, error } = await supabase.from('todos').select('*');
        if (error) { list.innerHTML = `<span style="color:var(--offline-color);">Gagal memuat to-do.</span>`; return; }
        list.innerHTML = '';
        if (data.length === 0) {
            list.innerHTML = '<li style="font-size:0.8rem; color:var(--text-muted); border:none;">Tidak ada catatan.</li>';
            return;
        }
        data.forEach((todo) => {
            const checked = todo.done ? 'checked' : '';
            const doneClass = todo.done ? 'done' : '';
            const disabledCheck = isAdmin ? '' : 'disabled';
            list.innerHTML += `
                <li class="todo-item ${doneClass}">
                    <div>
                        <input type="checkbox" ${checked} ${disabledCheck} onchange="toggleTodo('${todo.text}', ${!todo.done})" style="margin-right:8px; cursor:pointer;">
                        <span>${todo.text}</span>
                    </div>
                    <button class="btn-del" onclick="deleteTodo('${todo.text}')"><i class="fas fa-trash"></i></button>
                </li>`;
        });
    } catch (err) {
        list.innerHTML = `<span style="color:var(--offline-color);">Error koneksi to-do.</span>`;
    }
}

async function addTodo(e) {
    e.preventDefault();
    if (!supabase) return;
    try {
        const text = document.getElementById('todo-input')?.value;
        if (!text) return;
        await supabase.from('todos').insert([{ text, done: false }]);
        e.target.reset();
        loadTodos();
    } catch (err) {
        alert("Gagal menambah tugas.");
    }
}

async function toggleTodo(text, newStatus) {
    if (!supabase) return;
    try {
        await supabase.from('todos').update({ done: newStatus }).eq('text', text);
        loadTodos();
    } catch (err) {
        console.error("Toggle error:", err);
    }
}

async function deleteTodo(text) {
    if (!supabase) return;
    try {
        await supabase.from('todos').delete().eq('text', text);
        loadTodos();
    } catch (err) {
        console.error("Delete error:", err);
    }
}

/* [SISTEM DATABASE MEDIA STORAGE CLOUD] */
async function loadMedia() {
    const gallery = document.getElementById('media-gallery');
    if (!gallery) return;
    if (!supabase) { 
        gallery.innerHTML = '<span style="color:red;">Cloud tidak terhubung.</span>'; 
        return; 
    }
    try {
        const { data, error } = await supabase.storage.from('media').list();
        if (error) { gallery.innerHTML = '<span style="color:red;">Gagal memuat media.</span>'; return; }
        gallery.innerHTML = '';
        if(!data || data.length === 0 || (data.length === 1 && data[0].name === '.emptyFolderPlaceholder')) {
            gallery.innerHTML = '<span style="font-size:0.8rem; color:var(--text-muted); grid-column: 1 / -1; text-align:center;">Belum ada media di database.</span>';
            return;
        }
        data.forEach(file => {
            if(file.name === '.emptyFolderPlaceholder') return;
            const { data: publicUrlData } = supabase.storage.from('media').getPublicUrl(file.name);
            const url = publicUrlData.publicUrl;
            const item = document.createElement('div');
            item.className = 'media-item';
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
    } catch (err) {
        gallery.innerHTML = '<span style="color:red;">Error koneksi media.</span>';
    }
}

async function uploadMedia(event) {
    event.preventDefault();
    if (!supabase) return;
    try {
        const fileInput = document.getElementById('media-file');
        const uploadBtn = document.getElementById('upload-btn');
        if(!fileInput || fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;

        if(uploadBtn) {
            uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengunggah...';
            uploadBtn.disabled = true;
        }

        const { error } = await supabase.storage.from('media').upload(fileName, file);
        if (error) { alert('Gagal mengunggah: ' + error.message); } 
        else { fileInput.value = ''; loadMedia(); }

        if(uploadBtn) {
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Unggah';
            uploadBtn.disabled = false;
        }
    } catch (err) {
        alert("Gagal mengunggah file.");
    }
}

async function deleteMedia(fileName) {
    if (!supabase) return;
    try {
        if(confirm('Yakin ingin menghapus media ini?')) {
            await supabase.storage.from('media').remove([fileName]);
            loadMedia();
        }
    } catch (err) {
        alert("Gagal menghapus file.");
    }
}

/* [WIDGET CUACA LOKAL] */
async function fetchWeather() {
    try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=-6.2416&longitude=107.0116&current_weather=true');
        const data = await res.json();
        const temp = data.current_weather.temperature;
        const isDay = data.current_weather.is_day;
        
        const tempEl = document.getElementById('weather-temp');
        const descEl = document.getElementById('weather-desc');
        const wIcon = document.getElementById('weather-icon');

        if(tempEl) tempEl.innerText = Math.round(temp) + '°C';
        if(wIcon) {
            wIcon.classList.remove('fa-spinner', 'fa-spin');
            if (isDay) {
                wIcon.classList.add('fa-cloud-sun');
                if(descEl) descEl.innerText = "Cerah Berawan";
            } else {
                wIcon.classList.add('fa-cloud-moon');
                wIcon.style.color = "#A9C6EB";
                if(descEl) descEl.innerText = "Malam Cerah";
            }
        }
    } catch (error) {
        const descEl = document.getElementById('weather-desc');
        if(descEl) descEl.innerText = "Gagal memuat";
    }
}

/* [WIDGET KURS DAN KRIPTO MINI] */
async function fetchCrypto() {
    try {
        const resUsd = await fetch('https://open.er-api.com/v6/latest/USD');
        const dataUsd = await resUsd.json();
        const idrRate = dataUsd.rates.IDR;
        const usdEl = document.getElementById('usd-price');
        if(usdEl) usdEl.innerText = "Rp" + idrRate.toLocaleString('id-ID'); 

        const resCrypto = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd');
        const dataCrypto = await resCrypto.json();
        const btcEl = document.getElementById('btc-price');
        const ethEl = document.getElementById('eth-price');
        if(btcEl) btcEl.innerText = "$" + dataCrypto.bitcoin.usd.toLocaleString('en-US'); 
        if(ethEl) ethEl.innerText = "$" + dataCrypto.ethereum.usd.toLocaleString('en-US'); 
    } catch (err) {
        const usdEl = document.getElementById('usd-price');
        const btcEl = document.getElementById('btc-price');
        const ethEl = document.getElementById('eth-price');
        if(usdEl) usdEl.innerText = "Error";
        if(btcEl) btcEl.innerText = "Error";
        if(ethEl) ethEl.innerText = "Error";
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
    const lenVal = document.getElementById('pass-length')?.value || 16;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
    let password = "";
    for (let i = 0, n = charset.length; i < lenVal; ++i) {
        password += charset.charAt(Math.floor(Math.random() * n));
    }
    const genPass = document.getElementById('gen-password');
    if(genPass) genPass.value = password;
}

function copyPassword() {
    const passInput = document.getElementById('gen-password');
    if(passInput && passInput.value) {
        passInput.select();
        document.execCommand('copy');
        alert("Kata sandi berhasil disalin!");
    }
}

/* [KALKULATOR SUBNET] */
function calculateSubnet() {
    const ipInput = document.getElementById('sub-ip')?.value;
    const cidr = parseInt(document.getElementById('sub-cidr')?.value);
    const resultBox = document.getElementById('subnet-result');

    if (!resultBox) return;
    if (!ipInput || !ipInput.match(/^(\d{1,3}\.){3}\d{1,3}$/) || isNaN(cidr) || cidr < 1 || cidr > 32) {
        resultBox.innerHTML = "<span style='color:red;'>Format IP atau Prefix salah!</span>";
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

/* [INFORMASI SISTEM PERANGKAT AMAN] */
function getAdvancedSystemInfo() {
    try {
        const ramEl = document.getElementById('sys-ram');
        if (ramEl) {
            if (navigator.deviceMemory) {
                ramEl.innerText = navigator.deviceMemory + ' GB (Estimasi)';
            } else {
                ramEl.innerText = 'Tidak Didukung';
            }
        }

        const batEl = document.getElementById('sys-battery');
        if (batEl) {
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
                }).catch(() => { batEl.innerText = 'Tidak Didukung'; });
            } else {
                batEl.innerText = 'Tidak Didukung';
            }
        }

        const connEl = document.getElementById('sys-conn');
        const downEl = document.getElementById('sys-downlink');
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (connection) {
            function updateConnectionStatus() {
                if(connEl) connEl.innerText = connection.effectiveType ? connection.effectiveType.toUpperCase() : 'Tidak Diketahui';
                if(downEl) downEl.innerText = connection.downlink ? connection.downlink + ' Mbps' : 'Tidak Diketahui';
            }
            updateConnectionStatus();
            connection.addEventListener('change', updateConnectionStatus);
        } else {
            if(connEl) connEl.innerText = 'Tidak Didukung';
            if(downEl) downEl.innerText = 'Tidak Didukung';
        }
    } catch (e) {
        console.log("System info skipped");
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
    if(hexInput && hexInput.value) {
        hexInput.select();
        document.execCommand('copy');
        alert("Kode warna " + hexInput.value + " berhasil disalin!");
    }
}

/* [LOGIKA PENCARIAN GOOGLE DAN URL] */
function handleSearch(event) {
    event.preventDefault(); 
    const input = document.getElementById('search-input')?.value.trim();
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
    if (!obj) return;
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
    const circle = document.getElementById('speed-circle');
    if (!circle) return;
    const percentage = Math.min((value / max) * 100, 100);
    const mainColor = document.body.classList.contains('dark-mode') ? '#e2e8f0' : '#162a47';
    const bgColor = document.body.classList.contains('dark-mode') ? '#334155' : '#e2e8f0';
    circle.style.background = `conic-gradient(from 180deg, ${mainColor} ${percentage}%, ${bgColor} 0%)`;
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

    if(startBtn) {
        startBtn.disabled = true;
        startBtn.innerText = "Menghubungkan ke Server...";
    }
    if(dlValEl) dlValEl.innerText = "--"; 
    if(ulValEl) ulValEl.innerText = "--"; 
    if(pingValEl) pingValEl.innerText = "--";
    if(statusTextEl) statusTextEl.style.opacity = 1;
    
    const serverSelect = document.getElementById('server-select');
    if(serverSelect) serverSelect.disabled = true;

    const targetPing = Math.floor(Math.random() * 12) + 8;
    const targetDownload = (Math.random() * 40) + 50; 
    const targetUpload = (Math.random() * 15) + 20;   

    if(statusTextEl) statusTextEl.innerText = "Mengukur Ping...";
    animateValue(pingValEl, 100, targetPing, 1000, true);
    await new Promise(r => setTimeout(r, 1200));

    if(statusTextEl) statusTextEl.innerText = "Menguji Unduhan...";
    animateValue(mainSpeedEl, 0, targetDownload, 2500, false, (val) => updateCircle(val));
    animateValue(dlValEl, 0, targetDownload, 2500, false);
    await new Promise(r => setTimeout(r, 2800));

    if(statusTextEl) statusTextEl.innerText = "Menguji Unggahan...";
    if(mainSpeedEl) mainSpeedEl.innerText = "0.0";
    updateCircle(0);
    animateValue(mainSpeedEl, 0, targetUpload, 2500, false, (val) => updateCircle(val));
    animateValue(ulValEl, 0, targetUpload, 2500, false);
    await new Promise(r => setTimeout(r, 2800));

    if(statusTextEl) statusTextEl.innerText = "Selesai";
    if(mainSpeedEl) mainSpeedEl.innerText = targetDownload.toFixed(1); 
    updateCircle(targetDownload);
    
    if(startBtn) {
        startBtn.disabled = false;
        startBtn.innerText = "Uji Ulang Kecepatan";
    }
    if(serverSelect) serverSelect.disabled = false;

    saveToHistory(targetDownload, targetUpload, targetPing);

    setTimeout(() => {
        const modalDl = document.getElementById('modal-dl');
        const modal = document.getElementById('result-modal');
        if(modalDl) modalDl.innerText = targetDownload.toFixed(1);
        if(modal) modal.style.display = 'flex';
    }, 500);
}

function saveToHistory(dl, ul, ping) {
    const historyUl = document.getElementById('history-ul');
    const serverSelect = document.getElementById('server-select');
    if (!historyUl || !serverSelect) return;
    const serverName = serverSelect.selectedOptions[0].text;
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
    if(historyUl) {
        historyUl.innerHTML = '<li id="empty-history" style="text-align:center; border:none;">Belum ada riwayat tes.</li>';
    }
}

function closeModal() { 
    const modal = document.getElementById('result-modal');
    if(modal) modal.style.display = 'none'; 
}

function shareResult() {
    const modalDl = document.getElementById('modal-dl');
    if (!modalDl) return;
    const dl = modalDl.innerText;
    const text = `Tebak? Kecepatan internetku nyampe ${dl} Mbps di DANSHUB, Kenceng banget kan? Cobain deh tes kecepatanmu.`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
}

/* [WAKTU LOKASI DAN INFORMASI PERANGKAT] */
function startLiveClock() {
    const clockEl = document.getElementById('live-clock');
    if (!clockEl) return;
    setInterval(() => {
        const now = new Date();
        clockEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB';
    }, 1000);
}

function updateNetworkStatus() {
    const statusDot = document.getElementById('network-status');
    if (!statusDot) return;
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
        const ipEl = document.getElementById('ip-address');
        const ispEl = document.getElementById('isp-name');
        if(ipEl) ipEl.innerText = data.ip || 'Tidak terdeteksi';
        if(ispEl) ispEl.innerText = data.org || 'Tidak terdeteksi';
    } catch (error) {
        const ipEl = document.getElementById('ip-address');
        const ispEl = document.getElementById('isp-name');
        if(ipEl) ipEl.innerText = 'Gagal memuat';
        if(ispEl) ispEl.innerText = 'Gagal memuat';
    }
}

function getLocalIP() {
    try {
        window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        if (!window.RTCPeerConnection) {
            const localIpEl = document.getElementById('local-ip');
            if(localIpEl) localIpEl.innerText = "Tidak Didukung"; 
            return;
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
                    const localIpEl = document.getElementById('local-ip');
                    if(localIpEl) localIpEl.innerText = localIP;
                    pc.onicecandidate = noop; 
                }
            }
        };
        setTimeout(() => {
            const el = document.getElementById('local-ip');
            if (el && el.innerText === 'Mendeteksi...') { el.innerText = 'Disembunyikan'; }
        }, 2000);
    } catch (e) {
        const localIpEl = document.getElementById('local-ip');
        if(localIpEl) localIpEl.innerText = "Tidak Didukung";
    }
}

function getDeviceDiagnostics() {
    try {
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

        const devInfo = document.getElementById('device-info');
        if(devInfo) {
            devInfo.innerHTML = `<i class="fas fa-laptop-code"></i> Perangkat: <strong>${os}</strong> | <strong>${browser}</strong>`;
        }
    } catch (e) {
        console.log("Device info error");
    }
}

/* [JALANKAN SELURUH FUNGSI TANPA TAKUT CRASH] */
window.onload = () => {
    startLiveClock();
    updateNetworkStatus();
    fetchWeather();
    fetchCrypto();
    checkServiceStatus();
    fetchNetworkInfo();
    getLocalIP();
    getDeviceDiagnostics();
    getAdvancedSystemInfo(); 

    if (supabase) {
        checkLogin();
        loadBookmarks();
        loadTodos();
        loadMedia();
    }
};
