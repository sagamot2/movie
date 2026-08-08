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
                title: "🍿 ลานนาอยากไปดูหนัง!",
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
