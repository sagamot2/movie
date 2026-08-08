document.addEventListener('DOMContentLoaded', () => {
    const marqueeLights = document.getElementById('marqueeLights');
    if (marqueeLights) {
        const bulbCount = 9;
        for (let i = 0; i < bulbCount; i++) {
            const bulb = document.createElement('span');
            bulb.className = 'bulb';
            bulb.style.animationDelay = `${(i * 1.6) / bulbCount}s`;
            marqueeLights.appendChild(bulb);
        }
    }

    const modeToggle = document.getElementById('modeToggle');
    const htmlElement = document.documentElement;
    const currentTheme = localStorage.getItem('theme');
    
    if (currentTheme) htmlElement.setAttribute('data-mode', currentTheme);

    if (modeToggle) {
        modeToggle.addEventListener('click', () => {
            let newMode = htmlElement.getAttribute('data-mode') === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-mode', newMode);
            localStorage.setItem('theme', newMode);
        });
    }

    if (typeof flatpickr !== 'undefined') {
        flatpickr("#date-select", {
            dateFormat: "Y-m-d",
            minDate: "today", 
            disableMobile: "true" 
        });

        flatpickr("#time-select", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "H:i",
            time_24hr: true,
            disableMobile: "true"
        });
    }

    const cinemaCards = document.querySelectorAll('.cinema-card');
    let selectedCinemaValue = "";
    let selectedCinemaName = "ไม่ได้เลือก";

    cinemaCards.forEach(card => {
        card.addEventListener('click', () => {
            cinemaCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            selectedCinemaValue = card.getAttribute('data-cinema');
            selectedCinemaName = card.querySelector('.cinema-name').innerText;
        });
    });

    const showMovieBtn = document.getElementById('show-movie-btn');

    if (showMovieBtn) {
        showMovieBtn.addEventListener('click', () => {
            if (!selectedCinemaValue) {
                alert("จิ้มเลือกโรงหนังด้านบนก่อนนะน้องงง 🍿💙");
                return; 
            }

            let targetUrl = "";
            if (selectedCinemaValue === 'major') {
                targetUrl = "https://www.majorcineplex.com/cinema/major-central-festival-Chiangmai/";
            } else if (selectedCinemaValue === 'sf') {
                targetUrl = "https://www.sfcinema.com/th";
            }
            
            window.open(targetUrl, '_blank');
        });
    }

    const dateSelect = document.getElementById('date-select');
    const timeSelect = document.getElementById('time-select');
    const sendBtn = document.getElementById('send-discord-btn');
    const msgInput = document.getElementById('discord-msg');
    const fileInput = document.getElementById('image-upload');
    const previewWrapper = document.getElementById('preview-wrapper');
    const imagePreview = document.getElementById('image-preview');
    const removeImageBtn = document.getElementById('remove-image-btn');
 
    const ACHIEVEMENTS_KEY = 'movieBookingAchievements';
    const TOTAL_COUNT_KEY = 'movieBookingTotalCount';

    const ACHIEVEMENTS = [
        { id: 'first', threshold: 1, emoji: '🎉', title: 'นัดแรก!', reward: 'เริ่มต้นสวยๆ ของคู่เรา 💙' },
        { id: 'three', threshold: 3, emoji: '🎬', title: 'สายดูหนังตัวยง', reward: 'ปลดล็อก: บัตรหนังฟรี 1 ใบ' },
        { id: 'five', threshold: 5, emoji: '🍿', title: 'คู่หูโรงหนัง', reward: 'ปลดล็อก: ป็อปคอร์น+น้ำ 1 เซ็ต' },
        { id: 'ten', threshold: 10, emoji: '🏆', title: 'ตำนานดูหนังของกัส', reward: 'ปลดล็อก: เดตพิเศษเซอร์ไพรส์สุดปัง' },
        { id: 'twenty', threshold: 20, emoji: '💍', title: 'คู่ซี้ตลอดกาล', reward: 'ปลดล็อก: ทริปพิเศษด้วยกัน' }
    ];

    const achievementsGrid = document.getElementById('achievements-grid');
    const achievementsProgress = document.getElementById('achievements-progress');

    function getTotalCount() {
        return parseInt(localStorage.getItem(TOTAL_COUNT_KEY) || '0', 10) || 0;
    }

    function incrementTotalCount() {
        const c = getTotalCount() + 1;
        localStorage.setItem(TOTAL_COUNT_KEY, String(c));
        return c;
    }

    function getUnlockedAchievements() {
        try {
            return JSON.parse(localStorage.getItem(ACHIEVEMENTS_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveUnlockedAchievements(list) {
        localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(list));
    }

    function checkAchievements(totalCount) {
        const unlocked = getUnlockedAchievements();
        const newlyUnlocked = [];
        ACHIEVEMENTS.forEach(a => {
            if (totalCount >= a.threshold && !unlocked.includes(a.id)) {
                unlocked.push(a.id);
                newlyUnlocked.push(a);
            }
        });
        if (newlyUnlocked.length) saveUnlockedAchievements(unlocked);
        return newlyUnlocked;
    }

    function renderAchievements() {
        if (!achievementsGrid) return;
        const unlocked = getUnlockedAchievements();
        const totalCount = getTotalCount();

        achievementsGrid.innerHTML = '';
        ACHIEVEMENTS.forEach(a => {
            const isUnlocked = unlocked.includes(a.id);
            const card = document.createElement('div');
            card.className = 'achievement-card ' + (isUnlocked ? 'unlocked' : 'locked');

            const emoji = document.createElement('span');
            emoji.className = 'achievement-emoji';
            emoji.textContent = isUnlocked ? a.emoji : '🔒';

            const title = document.createElement('span');
            title.className = 'achievement-title';
            title.textContent = a.title;

            const desc = document.createElement('span');
            desc.className = 'achievement-desc';
            desc.textContent = isUnlocked ? a.reward : `ดูหนังครบ ${a.threshold} ครั้ง`;

            card.appendChild(emoji);
            card.appendChild(title);
            card.appendChild(desc);
            achievementsGrid.appendChild(card);
        });

        achievementsProgress.textContent = `ส่งแผนไปดูหนังแล้ว ${totalCount} ครั้ง 💌`;
    }

    function showAchievementToast(message) {
        const toast = document.createElement('div');
        toast.className = 'achievement-toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('show'));
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }

    renderAchievements();

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    imagePreview.src = event.target.result;
                    previewWrapper.style.display = 'inline-block';
                }
                reader.readAsDataURL(file);
            }
        });
    }

    if (removeImageBtn) {
        removeImageBtn.addEventListener('click', () => {
            fileInput.value = ''; 
            imagePreview.src = '';
            previewWrapper.style.display = 'none';
        });
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', () => {
            const text = msgInput.value.trim();
            const file = fileInput.files[0];

            if (text === "" && !file) {
                alert("พิมพ์ข้อความหรือแนบรูปมาก่อนส่งนะ  😆💙");
                return;
            }

            const originalBtnText = sendBtn.innerText;
            sendBtn.innerText = "กำลังส่ง... ⏳";
            sendBtn.disabled = true;

            const formData = new FormData();
            
            const selectedDate = dateSelect.value ? dateSelect.value : "ไม่ได้ระบุ";
            const selectedTime = timeSelect.value ? timeSelect.value : "ไม่ได้ระบุ";

            let displayMsg = text ? `ข้อความ: ${text} 💌` : ` ส่งรูปมาให้ดูงับ! 📷💙`;
            
            const embedCard = {
                title: "🍿 ,มีคนอยากไปดูหนัง!",
                description: displayMsg,
                color: 3718584, 
                fields: [
                    { name: "🎬 โรงหนัง", value: selectedCinemaName, inline: true },
                    { name: "📅 วันที่", value: selectedDate, inline: true },
                    { name: "⏰ เวลา", value: selectedTime, inline: true }
                ],
                footer: { text: "ระบบจองตั๋ว  ของกัส 💙" },
                timestamp: new Date().toISOString()
            };

            formData.append('payload_json', JSON.stringify({
                embeds: [embedCard] 
            }));
            
            if (file) {
                formData.append('file', file);
            }

            fetch('/.netlify/functions/notify', {
                method: 'POST',
                body: formData 
            }).then(res => {
                if (res.ok) {
                    alert("ส่งเรียบร้อยแล้วค้าบบบ เตรียมตัวไปกัน! 🥰💙");

                    const totalCount = incrementTotalCount();
                    const newlyUnlocked = checkAchievements(totalCount);
                    renderAchievements();
                    newlyUnlocked.forEach((a, i) => {
                        setTimeout(() => {
                            showAchievementToast(`${a.emoji} ปลดล็อกใหม่! ${a.title} — ${a.reward}`);
                        }, i * 3500);
                    });

                    msgInput.value = "";
                    fileInput.value = '';
                    imagePreview.src = '';
                    previewWrapper.style.display = 'none';
                } else {
                    alert("แง ส่งไม่สำเร็จ ลองใหม่อีกทีนะ");
                }
            }).catch(err => {
                console.error(err);
                alert("เน็ตหลุดป่าว  ลองกดส่งใหม่ดูนะ");
            }).finally(() => {
                sendBtn.innerText = originalBtnText;
                sendBtn.disabled = false;
            });
        });
    }
});
