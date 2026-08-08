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
 
    const MEMBER_KEY = 'movieBookingMember';
    const memberOverlay = document.getElementById('memberOverlay');
    const memberNameInput = document.getElementById('memberNameInput');
    const memberPhoneInput = document.getElementById('memberPhoneInput');
    const memberError = document.getElementById('memberError');
    const memberSubmitBtn = document.getElementById('memberSubmitBtn');
    const memberPill = document.getElementById('memberPill');
    const memberPillName = document.getElementById('memberPillName');
    const memberLogoutBtn = document.getElementById('memberLogoutBtn');

    let currentMember = null;

    function loadMember() {
        try {
            const raw = localStorage.getItem(MEMBER_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function saveMember(member) {
        currentMember = member;
        localStorage.setItem(MEMBER_KEY, JSON.stringify(member));
        renderMemberUI();
    }

    function clearMember() {
        currentMember = null;
        localStorage.removeItem(MEMBER_KEY);
        renderMemberUI();
    }

    function renderMemberUI() {
        if (currentMember) {
            memberOverlay.classList.remove('show');
            memberPill.style.display = 'flex';
            memberPillName.textContent = `👋 ${currentMember.name}`;
        } else {
            memberPill.style.display = 'none';
            memberOverlay.classList.add('show');
        }
    }

    function showMemberError(msg) {
        memberError.textContent = msg;
        memberError.style.display = 'block';
    }

    function hideMemberError() {
        memberError.style.display = 'none';
    }

    if (memberSubmitBtn) {
        memberSubmitBtn.addEventListener('click', async () => {
            hideMemberError();
            const name = memberNameInput.value.trim();
            const phone = memberPhoneInput.value.trim();

            if (!name) {
                showMemberError('กรอกชื่อก่อนนะ');
                return;
            }
            if (!/^0[0-9]{8,9}$/.test(phone)) {
                showMemberError('เบอร์โทรไม่ถูกต้อง กรอกเป็นตัวเลข 9-10 หลัก ขึ้นต้นด้วย 0');
                return;
            }

            const originalText = memberSubmitBtn.innerText;
            memberSubmitBtn.innerText = 'กำลังตรวจสอบ...';
            memberSubmitBtn.disabled = true;

            try {
                const res = await fetch('/.netlify/functions/members', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, phone })
                });
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data && data.error ? data.error : 'สมัครสมาชิกไม่สำเร็จ');
                }

                saveMember(data.member);
                memberNameInput.value = '';
                memberPhoneInput.value = '';
            } catch (err) {
                console.error(err);
                showMemberError(err.message || 'เชื่อมต่อไม่สำเร็จ ลองใหม่อีกทีนะ');
            } finally {
                memberSubmitBtn.innerText = originalText;
                memberSubmitBtn.disabled = false;
            }
        });
    }

    if (memberLogoutBtn) {
        memberLogoutBtn.addEventListener('click', () => {
            if (confirm('ออกจากระบบตอนนี้เลยไหม?')) {
                clearMember();
            }
        });
    }

    currentMember = loadMember();
    renderMemberUI();

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
            if (!currentMember) {
                memberOverlay.classList.add('show');
                showMemberError('สมัครสมาชิกก่อนถึงจะส่งได้นะ');
                return;
            }

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
                    { name: "👤 ผู้ส่ง", value: currentMember.name, inline: true },
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
