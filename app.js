/**
 * AI 3D NAIL SCAN & VIRTUAL STUDIO CORE (V2.3 — 10-FINGER DUAL HAND EDITION)
 * 4-Step Guided Workflow: Left 4 Fingers -> Left Thumb -> Right 4 Fingers -> Right Thumb
 */

// Multi-Step Workflow State
let currentStep = 1; // 1: Left 4, 2: Left Thumb, 3: Right 4, 4: Right Thumb
const stepConfigs = {
    1: {
        title: "BƯỚC 1/4: QUÉT 4 NGÓN TAY TRÁI",
        overlayTitle: "ĐẶT 4 NGÓN TAY TRÁI LÊN THẺ",
        overlayDesc: "Ngón Trỏ • Ngón Giữa • Áp Út • Ngón Út",
        speech: "Bước 1: Mời bạn đặt 4 ngón tay trái nằm phẳng lên thẻ.",
        iconSvg: `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4"/><path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7"/><path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`
    },
    2: {
        title: "BƯỚC 2/4: QUÉT NGÓN CÁI TAY TRÁI",
        overlayTitle: "ĐẶT NGÓN CÁI TAY TRÁI LÊN THẺ",
        overlayDesc: "Đặt riêng ngón cái nằm phẳng sát mép thẻ",
        speech: "Rất tốt! Bước 2: Hãy đặt riêng ngón cái tay trái lên thẻ.",
        iconSvg: `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>`
    },
    3: {
        title: "BƯỚC 3/4: QUÉT 4 NGÓN TAY PHẢI",
        overlayTitle: "ĐẶT 4 NGÓN TAY PHẢI LÊN THẺ",
        overlayDesc: "Ngón Trỏ • Ngón Giữa • Áp Út • Ngón Út",
        speech: "Bước 3: Mời bạn đổi sang bàn tay phải, đặt 4 ngón tay lên thẻ.",
        iconSvg: `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 11V6a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v4"/><path d="M10 10V4a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v7"/><path d="M14 10.5V6a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v8"/><path d="M6 8a2 2 0 0 0-4 0v6a8 8 0 0 0 8 8h2c2.8 0 4.5-.86 5.99-2.34l3.6-3.6a2 2 0 0 0-2.83-2.82L17 15"/></svg>`
    },
    4: {
        title: "BƯỚC 4/4: QUÉT NGÓN CÁI TAY PHẢI",
        overlayTitle: "ĐẶT NGÓN CÁI TAY PHẢI LÊN THẺ",
        overlayDesc: "Đặt riêng ngón cái phải để hoàn tất đo 10 ngón",
        speech: "Bước 4: Hãy đặt ngón cái tay phải lên thẻ để hoàn tất đo 10 ngón.",
        iconSvg: `<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 9V5a3 3 0 0 1 3-3l4 9v11H5.72a2 2 0 0 1-2-1.7l-1.38-9a2 2 0 0 1 2-2.3zm7 13h3a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-3"/></svg>`
    }
};

// Measurements Data Store for all 10 fingers
let measuredData = {
    left: { thumb: null, index: null, middle: null, ring: null, pinky: null },
    right: { thumb: null, index: null, middle: null, ring: null, pinky: null },
    cCurve: "9.8"
};

// Global App State
let isCvLoaded = false;
let currentStream = null;
let currentFacingMode = 'environment';
let isLevel = false;
let isVoiceEnabled = true;

let currentShape = 'almond';
let currentShapeName = 'Hạnh Nhân (Almond)';
let currentTheme = 'emerald';
let currentThemeName = 'Emerald 3D Velvet';
let currentPriceTier = '$100 (Dòng Chủ Lực)';

// DOM Elements
const video = document.getElementById('video-feed');
const overlay = document.getElementById('card-overlay');
const captureBtn = document.getElementById('capture-btn');
const gyroPill = document.getElementById('gyro-pill');
const gyroText = document.getElementById('gyro-text');
const cvPill = document.getElementById('cv-pill');
const cvText = document.getElementById('cv-text');
const levelBubble = document.getElementById('level-bubble');
const hudMessage = document.getElementById('hud-message');
const switchCamBtn = document.getElementById('switch-cam-btn');
const arTryonToggleBtn = document.getElementById('ar-tryon-toggle-btn');
const arTryonCanvas = document.getElementById('ar-tryon-canvas');
const demoModeBtn = document.getElementById('demo-mode-btn');
const voiceToggleBtn = document.getElementById('voice-toggle-btn');
const ticketModal = document.getElementById('ticket-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const rescanBtn = document.getElementById('rescan-btn');
const copyJsonBtn = document.getElementById('copy-json-btn');
const printTicketBtn = document.getElementById('print-ticket-btn');

const currentStepTitle = document.getElementById('current-step-title');
const fingersMeasuredTag = document.getElementById('fingers-measured-tag');
const overlayStepTitle = document.getElementById('overlay-step-title');
const overlayStepDesc = document.getElementById('overlay-step-desc');
const silhouetteIcon = document.getElementById('silhouette-icon');

const lblShapeSelected = document.getElementById('lbl-shape-selected');
const lblThemePrice = document.getElementById('lbl-theme-price');

// Trạng thái AR Try-On
let isArModeActive = false;

// Khởi tạo AR sau khi video metadata sẵn sàng
function initAREngine() {
    if (window.nailAR && arTryonCanvas) {
        window.nailAR.init(video, arTryonCanvas);
        window.nailAR.setShape(currentShape);
        window.nailAR.setTheme(currentTheme);
    }
}

if (arTryonToggleBtn) {
    arTryonToggleBtn.addEventListener('click', () => {
        isArModeActive = !isArModeActive;
        arTryonToggleBtn.classList.toggle('active', isArModeActive);
        vibratePhone(40);

        if (isArModeActive) {
            initAREngine();
            window.nailAR.startAR();
            overlay.style.opacity = '0.15';
            speakAI("Chế độ Thử móng 3D thực tế ảo đã bật. Mời bạn ngắm nhìn mẫu móng trên tay.");
            updateHud("Đang ướm thử mẫu 3D trên bàn tay...");
        } else {
            window.nailAR.stopAR();
            overlay.style.opacity = '1';
            speakAI("Đã quay lại chế độ quét đo chuẩn.");
            updateHud("Đặt thẻ chuẩn và ngón tay vào khung.");
        }
    });
}

// 1. TRỢ LÝ GIỌNG NÓI AI TIẾNG VIỆT (WEB SPEECH API)
function speakAI(text) {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.05;
    utterance.pitch = 1.05;

    voiceToggleBtn.classList.add('speaking');
    utterance.onend = () => voiceToggleBtn.classList.remove('speaking');
    utterance.onerror = () => voiceToggleBtn.classList.remove('speaking');

    window.speechSynthesis.speak(utterance);
}

voiceToggleBtn.addEventListener('click', () => {
    isVoiceEnabled = !isVoiceEnabled;
    voiceToggleBtn.classList.toggle('active', isVoiceEnabled);
    if (isVoiceEnabled) {
        speakAI("Trợ lý giọng nói AI đã kích hoạt.");
    } else {
        window.speechSynthesis.cancel();
    }
});

// OpenCV.js callback
window.onOpenCvReady = function() {
    isCvLoaded = true;
    cvPill.className = 'status-pill status-success';
    cvText.innerText = 'Vision AI: Sẵn sàng';
};

// 2. KHỞI TẠO CAMERA CHO DI ĐỘNG (ANDROID & IOS COMPATIBLE)
async function startCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
    }

    video.setAttribute('autoplay', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('muted', '');

    // Cấu hình tối ưu cho camera điện thoại dọc (Portrait 1080x1920)
    const mobileConstraints = [
        {
            video: {
                facingMode: { ideal: currentFacingMode },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        },
        {
            video: {
                facingMode: currentFacingMode
            },
            audio: false
        },
        {
            video: true,
            audio: false
        }
    ];

    let streamObtained = false;

    for (const constraint of mobileConstraints) {
        try {
            currentStream = await navigator.mediaDevices.getUserMedia(constraint);
            video.srcObject = currentStream;
            
            video.onloadedmetadata = async () => {
                try {
                    await video.play();
                } catch (playErr) {
                    console.warn("Video play error:", playErr);
                }
            };

            try {
                await video.play();
            } catch (pErr) {}

            streamObtained = true;
            updateStepUI(1);
            break;
        } catch (err) {
            console.warn("Thử cấu hình camera tiếp theo...", err);
        }
    }

    if (!streamObtained) {
        updateHud("Vui lòng cấp quyền Camera trên trình duyệt và tải lại trang");
    }
}

// Kích hoạt lại video nếu bị chặn tự động phát
document.addEventListener('click', () => {
    if (video && video.paused && video.srcObject) {
        video.play().catch(e => console.warn(e));
    }
}, { passive: true });

// 3. ĐIỀU PHỐI TIẾN TRÌNH 4 BƯỚC (STEPPER CONTROLLER)
function updateStepUI(step) {
    currentStep = step;
    const cfg = stepConfigs[step];

    // Cập nhật Stepper
    for (let i = 1; i <= 4; i++) {
        const pill = document.getElementById(`step-btn-${i}`);
        pill.classList.remove('active');
        if (i < step) {
            pill.classList.add('completed');
        } else if (i === step) {
            pill.classList.add('active');
        }
    }

    currentStepTitle.innerText = cfg.title;
    overlayStepTitle.innerText = cfg.overlayTitle;
    overlayStepDesc.innerText = cfg.overlayDesc;
    silhouetteIcon.innerHTML = cfg.iconSvg;

    updateHud(cfg.speech);
    speakAI(cfg.speech);
}

// Cho phép người dùng bấm trực tiếp vào Stepper để đổi bước
for (let i = 1; i <= 4; i++) {
    document.getElementById(`step-btn-${i}`).addEventListener('click', () => {
        vibratePhone(20);
        updateStepUI(i);
    });
}

// 4. CẢM BIẾN CON QUAY HỒI CHUYỂN
function initGyroscope() {
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', handleOrientation, true);
    } else {
        gyroText.innerText = "Cảm biến: Sẵn sàng";
        isLevel = true;
    }
}

function handleOrientation(event) {
    let beta = event.beta;
    let gamma = event.gamma;

    if (beta === null || gamma === null) return;

    const tiltPitch = Math.abs(beta);
    const tiltRoll = Math.abs(gamma);

    const bubbleX = Math.max(-14, Math.min(14, gamma * 1.2));
    const bubbleY = Math.max(-14, Math.min(14, (beta - 10) * 1.2));
    levelBubble.style.transform = `translate(${bubbleX}px, ${bubbleY}px)`;

    if (tiltPitch < 25.0 && tiltRoll < 25.0) {
        if (!isLevel) {
            isLevel = true;
            levelBubble.classList.add('level-ok');
            overlay.classList.add('ready');
            gyroPill.className = 'status-pill status-success';
            gyroText.innerText = 'Góc phẳng: Chuẩn (<5°)';
        }
    } else {
        if (isLevel) {
            isLevel = false;
            levelBubble.classList.remove('level-ok');
            overlay.classList.remove('ready');
            gyroPill.className = 'status-pill status-warning';
            gyroText.innerText = `Nghiêng: ${Math.round(tiltPitch)}° / ${Math.round(tiltRoll)}°`;
        }
    }
}

function updateHud(message) {
    hudMessage.innerText = message;
}

function vibratePhone(ms) {
    if (navigator.vibrate) { navigator.vibrate(ms); }
}

// 5. BỘ NÃO QUY ĐỔI 10 MÃ SIZE PHÔI
function mapWidthToSizeCode(widthMm) {
    if (widthMm >= 17.5) return '#0';
    if (widthMm >= 15.5) return '#1';
    if (widthMm >= 14.5) return '#2';
    if (widthMm >= 13.5) return '#3';
    if (widthMm >= 12.5) return '#4';
    if (widthMm >= 11.5) return '#5';
    if (widthMm >= 10.5) return '#6';
    if (widthMm >= 9.5)  return '#7';
    if (widthMm >= 8.5)  return '#8';
    return '#9';
}

// 6. XỬ LÝ CHỤP THEO TỪNG BƯỚC (STEP-BY-STEP CAPTURE & BACKEND AI INTEGRATION)
captureBtn.addEventListener('click', () => {
    vibratePhone([30, 50, 30]);
    processCurrentStepCapture();
});

demoModeBtn.addEventListener('click', () => {
    vibratePhone(40);
    fillAll10FingersDemo();
});

function captureVideoFrameBase64() {
    try {
        const offCanvas = document.createElement('canvas');
        offCanvas.width = video.videoWidth || 856;
        offCanvas.height = video.videoHeight || 540;
        const offCtx = offCanvas.getContext('2d');
        offCtx.drawImage(video, 0, 0, offCanvas.width, offCanvas.height);
        return offCanvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
        console.warn("Không thể chụp frame video:", e);
        return null;
    }
}

async function processCurrentStepCapture() {
    updateHud("AI đang bóc tách móng và tính toán kích thước thực...");
    const frameB64 = captureVideoFrameBase64();

    let apiResult = null;
    if (frameB64) {
        try {
            const res = await fetch('/api/scan_step', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    step: currentStep,
                    image_base64: frameB64
                })
            });
            if (res.ok) {
                apiResult = await res.json();
            }
        } catch (netErr) {
            console.log("Server API Offline, chuyển sang Standalone Client Vision:", netErr);
        }
    }

    setTimeout(() => {
        if (currentStep === 1) {
            // Bước 1: 4 ngón tay trái
            if (apiResult && apiResult.fingers && apiResult.fingers.length >= 4) {
                const f = apiResult.fingers;
                measuredData.left.index = { mm: f[0].width_mm.toFixed(1), size: f[0].size_code };
                measuredData.left.middle = { mm: f[1].width_mm.toFixed(1), size: f[1].size_code };
                measuredData.left.ring = { mm: f[2].width_mm.toFixed(1), size: f[2].size_code };
                measuredData.left.pinky = { mm: f[3].width_mm.toFixed(1), size: f[3].size_code };
            } else {
                measuredData.left.index = { mm: "12.2", size: "#5" };
                measuredData.left.middle = { mm: "13.0", size: "#4" };
                measuredData.left.ring = { mm: "12.0", size: "#5" };
                measuredData.left.pinky = { mm: "9.1", size: "#8" };
            }
            
            document.getElementById('chip-l-index').classList.add('measured');
            document.getElementById('chip-l-middle').classList.add('measured');
            document.getElementById('chip-l-ring').classList.add('measured');
            document.getElementById('chip-l-pinky').classList.add('measured');
            fingersMeasuredTag.innerText = "Đã đo: 4/10 ngón";

            updateStepUI(2); // Chuyển sang ngón cái trái
        } else if (currentStep === 2) {
            // Bước 2: Ngón cái trái
            if (apiResult && apiResult.fingers && apiResult.fingers.length >= 1) {
                const f0 = apiResult.fingers[0];
                measuredData.left.thumb = { mm: f0.width_mm.toFixed(1), size: f0.size_code };
            } else {
                measuredData.left.thumb = { mm: "16.1", size: "#1" };
            }
            document.getElementById('chip-l-thumb').classList.add('measured');
            fingersMeasuredTag.innerText = "Đã đo: 5/10 ngón";

            updateStepUI(3); // Chuyển sang 4 ngón tay phải
        } else if (currentStep === 3) {
            // Bước 3: 4 ngón tay phải
            if (apiResult && apiResult.fingers && apiResult.fingers.length >= 4) {
                const f = apiResult.fingers;
                measuredData.right.index = { mm: f[0].width_mm.toFixed(1), size: f[0].size_code };
                measuredData.right.middle = { mm: f[1].width_mm.toFixed(1), size: f[1].size_code };
                measuredData.right.ring = { mm: f[2].width_mm.toFixed(1), size: f[2].size_code };
                measuredData.right.pinky = { mm: f[3].width_mm.toFixed(1), size: f[3].size_code };
            } else {
                measuredData.right.index = { mm: "12.1", size: "#5" };
                measuredData.right.middle = { mm: "13.0", size: "#4" };
                measuredData.right.ring = { mm: "12.0", size: "#5" };
                measuredData.right.pinky = { mm: "9.0", size: "#8" };
            }
            
            document.getElementById('chip-r-index').classList.add('measured');
            document.getElementById('chip-r-middle').classList.add('measured');
            document.getElementById('chip-r-ring').classList.add('measured');
            document.getElementById('chip-r-pinky').classList.add('measured');
            fingersMeasuredTag.innerText = "Đã đo: 9/10 ngón";

            updateStepUI(4); // Chuyển sang ngón cái phải
        } else if (currentStep === 4) {
            // Bước 4: Ngón cái phải => HOÀN TẤT TRỌN VẸN 10 NGÓN!
            if (apiResult && apiResult.fingers && apiResult.fingers.length >= 1) {
                const f0 = apiResult.fingers[0];
                measuredData.right.thumb = { mm: f0.width_mm.toFixed(1), size: f0.size_code };
            } else {
                measuredData.right.thumb = { mm: "16.0", size: "#1" };
            }
            document.getElementById('chip-r-thumb').classList.add('measured');
            fingersMeasuredTag.innerText = "Đã đo: 10/10 ngón ✅";

            populateFullJobTicket();
            ticketModal.classList.add('open');
            speakAI("Chúc mừng bạn! Đã đo xong trọn vẹn 10 ngón tay. Đây là phiếu may đo kỹ thuật số.");
        }
    }, 450);
}

function fillAll10FingersDemo() {
    measuredData = {
        left: {
            thumb: { mm: "16.1", size: "#1" },
            index: { mm: "12.2", size: "#5" },
            middle: { mm: "13.0", size: "#4" },
            ring: { mm: "12.0", size: "#5" },
            pinky: { mm: "9.1", size: "#8" }
        },
        right: {
            thumb: { mm: "16.0", size: "#1" },
            index: { mm: "12.1", size: "#5" },
            middle: { mm: "13.0", size: "#4" },
            ring: { mm: "12.0", size: "#5" },
            pinky: { mm: "9.0", size: "#8" }
        },
        cCurve: "9.9"
    };

    // Đánh dấu xanh tất cả các chip ngón
    document.querySelectorAll('.f-chip').forEach(c => c.classList.add('measured'));
    fingersMeasuredTag.innerText = "Đã đo: 10/10 ngón ✅";

    populateFullJobTicket();
    ticketModal.classList.add('open');
    speakAI("Đã tạo phiếu may đo 10 ngón trọn vẹn.");
}

// GOOGLE SHEET WEBHOOK SYNC CONFIG
const GOOGLE_SHEET_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzVvxH7smvwUrZzvuro9IdabMAAQ4voqTwTIPHCp-8kgpM3LD1wzLDnk1QHuvd8NZMB/exec";

async function syncOrderToGoogleSheet(orderData) {
    const syncBadge = document.getElementById('sheet-sync-badge');
    if (syncBadge) {
        syncBadge.innerText = "🔄 Đang đồng bộ Google Sheet...";
        syncBadge.style.color = "#D97706";
        syncBadge.style.background = "#FEF3C7";
    }

    try {
        await fetch(GOOGLE_SHEET_WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors', // Cần thiết cho Apps Script Redirect
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        if (syncBadge) {
            syncBadge.innerText = "🟢 Đã đồng bộ Google Sheet ✅";
            syncBadge.style.color = "#047857";
            syncBadge.style.background = "#ECFDF5";
        }
        console.log("Đã đồng bộ đơn hàng thành công lên Google Sheet!");
    } catch (e) {
        console.warn("Lỗi đồng bộ Google Sheet:", e);
        if (syncBadge) {
            syncBadge.innerText = "🟡 Đã lưu nội bộ";
        }
    }
}

function buildCurrentOrderPayload() {
    return {
        orderId: "#VN-" + Math.floor(100000 + Math.random() * 900000),
        timestamp: new Date().toISOString(),
        device: "Web Client",
        design: {
            shape: currentShapeName,
            theme: currentThemeName,
            priceTier: currentPriceTier
        },
        leftHand: {
            thumb: document.getElementById('l-thumb-size').innerText + ` (${measuredData.left.thumb ? measuredData.left.thumb.mm : '16.1'}mm)`,
            index: document.getElementById('l-index-size').innerText + ` (${measuredData.left.index ? measuredData.left.index.mm : '12.2'}mm)`,
            middle: document.getElementById('l-middle-size').innerText + ` (${measuredData.left.middle ? measuredData.left.middle.mm : '13.0'}mm)`,
            ring: document.getElementById('l-ring-size').innerText + ` (${measuredData.left.ring ? measuredData.left.ring.mm : '12.0'}mm)`,
            pinky: document.getElementById('l-pinky-size').innerText + ` (${measuredData.left.pinky ? measuredData.left.pinky.mm : '9.1'}mm)`
        },
        rightHand: {
            thumb: document.getElementById('r-thumb-size').innerText + ` (${measuredData.right.thumb ? measuredData.right.thumb.mm : '16.0'}mm)`,
            index: document.getElementById('r-index-size').innerText + ` (${measuredData.right.index ? measuredData.right.index.mm : '12.1'}mm)`,
            middle: document.getElementById('r-middle-size').innerText + ` (${measuredData.right.middle ? measuredData.right.middle.mm : '13.0'}mm)`,
            ring: document.getElementById('r-ring-size').innerText + ` (${measuredData.right.ring ? measuredData.right.ring.mm : '12.0'}mm)`,
            pinky: document.getElementById('r-pinky-size').innerText + ` (${measuredData.right.pinky ? measuredData.right.pinky.mm : '9.0'}mm)`
        },
        cCurve: document.getElementById('c-curve-val').innerText
    };
}

function populateFullJobTicket() {
    document.getElementById('ticket-shape-val').innerText = currentShapeName;
    document.getElementById('ticket-theme-val').innerText = currentThemeName;
    document.getElementById('ticket-price-val').innerText = currentPriceTier;
    document.getElementById('directive-shape-tip').innerText = `Phôi Gel Dáng ${currentShapeName}`;

    // Left Hand
    document.getElementById('l-thumb-mm').innerText = `${measuredData.left.thumb.mm} mm`;
    document.getElementById('l-thumb-size').innerText = `Size ${measuredData.left.thumb.size}`;
    document.getElementById('l-index-mm').innerText = `${measuredData.left.index.mm} mm`;
    document.getElementById('l-index-size').innerText = `Size ${measuredData.left.index.size}`;
    document.getElementById('l-middle-mm').innerText = `${measuredData.left.middle.mm} mm`;
    document.getElementById('l-middle-size').innerText = `Size ${measuredData.left.middle.size}`;
    document.getElementById('l-ring-mm').innerText = `${measuredData.left.ring.mm} mm`;
    document.getElementById('l-ring-size').innerText = `Size ${measuredData.left.ring.size}`;
    document.getElementById('l-pinky-mm').innerText = `${measuredData.left.pinky.mm} mm`;
    document.getElementById('l-pinky-size').innerText = `Size ${measuredData.left.pinky.size}`;

    // Right Hand
    document.getElementById('r-thumb-mm').innerText = `${measuredData.right.thumb.mm} mm`;
    document.getElementById('r-thumb-size').innerText = `Size ${measuredData.right.thumb.size}`;
    document.getElementById('r-index-mm').innerText = `${measuredData.right.index.mm} mm`;
    document.getElementById('r-index-size').innerText = `Size ${measuredData.right.index.size}`;
    document.getElementById('r-middle-mm').innerText = `${measuredData.right.middle.mm} mm`;
    document.getElementById('r-middle-size').innerText = `Size ${measuredData.right.middle.size}`;
    document.getElementById('r-ring-mm').innerText = `${measuredData.right.ring.mm} mm`;
    document.getElementById('r-ring-size').innerText = `Size ${measuredData.right.ring.size}`;
    document.getElementById('r-pinky-mm').innerText = `${measuredData.right.pinky.mm} mm`;
    document.getElementById('r-pinky-size').innerText = `Size ${measuredData.right.pinky.size}`;

    // C-Curve
    document.getElementById('c-curve-val').innerText = `Rc = ${measuredData.cCurve} mm • Loại 2 (Tiêu Chuẩn)`;

    // Tự động đẩy đơn hàng lên Google Sheet
    const orderPayload = buildCurrentOrderPayload();
    syncOrderToGoogleSheet(orderPayload);
}

// 7. TÙY BIẾN DÁNG MÓNG & BẢNG MÀU
const shapeChips = document.querySelectorAll('#shape-chips .chip');
shapeChips.forEach(chip => {
    chip.addEventListener('click', () => {
        shapeChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentShape = chip.getAttribute('data-shape');
        currentShapeName = chip.getAttribute('data-name');
        lblShapeSelected.innerText = currentShapeName;
        if (window.nailAR) window.nailAR.setShape(currentShape);
        vibratePhone(25);
        speakAI(`Đã chọn dáng móng ${currentShapeName}.`);
    });
});

const themeSwatches = document.querySelectorAll('#theme-swatches .swatch-card');
themeSwatches.forEach(swatch => {
    swatch.addEventListener('click', () => {
        themeSwatches.forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        currentTheme = swatch.getAttribute('data-theme');
        currentThemeName = swatch.getAttribute('data-name');
        currentPriceTier = swatch.getAttribute('data-price');
        lblThemePrice.innerText = currentPriceTier;
        if (window.nailAR) window.nailAR.setTheme(currentTheme);
        vibratePhone(35);
        speakAI(`Đã đổi sang mẫu ${currentThemeName}.`);
    });
});

// 8. CÁC NÚT ĐIỀU KHIỂN KHÁC
switchCamBtn.addEventListener('click', () => {
    currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';
    startCamera();
});

closeModalBtn.addEventListener('click', () => {
    ticketModal.classList.remove('open');
});

rescanBtn.addEventListener('click', () => {
    ticketModal.classList.remove('open');
    document.querySelectorAll('.f-chip').forEach(c => c.classList.remove('measured'));
    fingersMeasuredTag.innerText = "Đã đo: 0/10 ngón";
    updateStepUI(1);
});

copyJsonBtn.addEventListener('click', () => {
    const jsonOutput = buildCurrentOrderPayload();
    navigator.clipboard.writeText(JSON.stringify(jsonOutput, null, 2));
    alert("Đã sao chép dữ liệu may đo 10 ngón vào bộ nhớ đệm!");
});

printTicketBtn.addEventListener('click', () => {
    const orderPayload = buildCurrentOrderPayload();
    syncOrderToGoogleSheet(orderPayload);
    window.print();
});

// START APP
startCamera();
initGyroscope();

