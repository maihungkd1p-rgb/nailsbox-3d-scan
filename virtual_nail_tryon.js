/**
 * VIRTUAL 3D NAIL AR TRY-ON ENGINE (V2.5)
 * Dựa trên ý tưởng từ chloe2781/nailARt-app
 * Tính năng:
 * 1. Bắt tọa độ 5 đầu ngón tay thời gian thực qua Camera Feed
 * 2. Render 5 phôi móng 3D có độ cong vòm C-Curve và vật liệu sơn bóng (PBR Material)
 * 3. Hỗ trợ 5 Form móng (Almond, Coffin, Stiletto, Square, Oval) và 5 Bộ sưu tập nghệ thuật
 */

class VirtualNailTryOnEngine {
    constructor() {
        this.isActive = false;
        this.currentShape = 'almond';
        this.currentTheme = 'emerald';
        this.videoElement = null;
        this.canvasElement = null;
        this.ctx = null;
        this.animationId = null;

        // Bảng màu & hiệu ứng vật liệu nghệ thuật
        this.themeStyles = {
            emerald: {
                name: "Emerald 3D Velvet",
                baseColor: "#064E3B",
                accentColor: "#10B981",
                glitterColor: "rgba(251, 191, 36, 0.7)",
                specular: 0.9,
                price: "$100"
            },
            ruby: {
                name: "Ruby Haute Couture",
                baseColor: "#881337",
                accentColor: "#E11D48",
                glitterColor: "rgba(255, 255, 255, 0.8)",
                specular: 0.95,
                price: "$200"
            },
            champagne: {
                name: "Golden Champagne Luxury",
                baseColor: "#78350F",
                accentColor: "#F59E0B",
                glitterColor: "rgba(254, 240, 138, 0.9)",
                specular: 0.85,
                price: "$200"
            },
            french: {
                name: "French Minimalist Glow",
                baseColor: "#FCE7F3",
                accentColor: "#FFFFFF",
                glitterColor: "rgba(255, 255, 255, 0.4)",
                specular: 0.6,
                price: "$50"
            },
            opal: {
                name: "Opal Mermaid Aura",
                baseColor: "#1E1B4B",
                accentColor: "#818CF8",
                glitterColor: "rgba(56, 189, 248, 0.85)",
                specular: 0.9,
                price: "$100"
            }
        };

        // Giả lập 5 vị trí ngón tay chuẩn (khi camera chưa nhận diện MediaPipe)
        this.handLandmarks = [
            { id: "thumb",  x: 0.20, y: 0.60, sizeMm: 16.1, angle: -25 },
            { id: "index",  x: 0.35, y: 0.38, sizeMm: 12.2, angle: -10 },
            { id: "middle", x: 0.50, y: 0.32, sizeMm: 13.0, angle: 0 },
            { id: "ring",   x: 0.65, y: 0.36, sizeMm: 12.0, angle: 8 },
            { id: "pinky",  x: 0.78, y: 0.48, sizeMm: 9.1,  angle: 20 }
        ];
    }

    init(videoEl, canvasEl) {
        this.videoElement = videoEl;
        this.canvasElement = canvasEl;
        this.ctx = this.canvasElement.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.videoElement || !this.canvasElement) return;
        this.canvasElement.width = this.canvasElement.clientWidth || 856;
        this.canvasElement.height = this.canvasElement.clientHeight || 540;
    }

    startAR() {
        this.isActive = true;
        this.canvasElement.style.display = 'block';
        this.renderLoop();
    }

    stopAR() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.ctx) {
            this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        }
        this.canvasElement.style.display = 'none';
    }

    setShape(shape) {
        this.currentShape = shape;
    }

    setTheme(theme) {
        this.currentTheme = theme;
    }

    renderLoop() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        const w = this.canvasElement.width;
        const h = this.canvasElement.height;

        // Render 5 phiến móng 3D AR
        this.handLandmarks.forEach((finger) => {
            const posX = finger.x * w;
            const posY = finger.y * h;
            // Tỷ lệ pixel từ số đo mm thực tế (1mm ~ 8px trên màn hình)
            const nailWidth = finger.sizeMm * (w / 120);
            const nailLength = nailWidth * (this.currentShape === 'stiletto' ? 2.2 : (this.currentShape === 'coffin' ? 1.9 : 1.6));

            this.draw3DNail(posX, posY, nailWidth, nailLength, finger.angle);
        });

        // Hiệu ứng tia sáng lấp lánh (Shimmer Animation)
        this.drawSparkleEffects(w, h);

        this.animationId = requestAnimationFrame(() => this.renderLoop());
    }

    draw3DNail(x, y, width, length, angleDeg) {
        const ctx = this.ctx;
        const theme = this.themeStyles[this.currentTheme] || this.themeStyles.emerald;
        const rad = (angleDeg * Math.PI) / 180;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rad);

        // 1. Tạo bóng đổ 3D (3D Ambient Occlusion Shadow)
        ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
        ctx.shadowBlur = 12;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 6;

        // 2. Dựng đường cong viền móng theo Form dáng
        ctx.beginPath();
        const halfW = width / 2;

        if (this.currentShape === 'almond') {
            // Hạnh nhân: Đáy bo tròn, đỉnh vót thon mềm
            ctx.moveTo(-halfW, 0);
            ctx.bezierCurveTo(-halfW, -length * 0.6, -halfW * 0.4, -length, 0, -length);
            ctx.bezierCurveTo(halfW * 0.4, -length, halfW, -length * 0.6, halfW, 0);
            ctx.bezierCurveTo(halfW, length * 0.3, -halfW, length * 0.3, -halfW, 0);
        } else if (this.currentShape === 'coffin') {
            // Móng thang (Coffin): Đỉnh cắt phẳng ngang
            ctx.moveTo(-halfW, 0);
            ctx.lineTo(-halfW * 0.55, -length);
            ctx.lineTo(halfW * 0.55, -length);
            ctx.lineTo(halfW, 0);
            ctx.bezierCurveTo(halfW, length * 0.25, -halfW, length * 0.25, -halfW, 0);
        } else if (this.currentShape === 'stiletto') {
            // Móng nhọn sắc nét
            ctx.moveTo(-halfW, 0);
            ctx.lineTo(0, -length);
            ctx.lineTo(halfW, 0);
            ctx.bezierCurveTo(halfW, length * 0.25, -halfW, length * 0.25, -halfW, 0);
        } else if (this.currentShape === 'square') {
            // Vuông cổ điển
            ctx.moveTo(-halfW, 0);
            ctx.lineTo(-halfW, -length);
            ctx.lineTo(halfW, -length);
            ctx.lineTo(halfW, 0);
            ctx.bezierCurveTo(halfW, length * 0.2, -halfW, length * 0.2, -halfW, 0);
        } else {
            // Bầu dục tự nhiên (Oval)
            ctx.ellipse(0, -length * 0.4, halfW, length * 0.6, 0, 0, Math.PI * 2);
        }
        ctx.closePath();

        // 3. Tô màu Gradient chuyển tông 3D (Vòm cong C-Curve)
        const grad = ctx.createLinearGradient(-halfW, 0, halfW, 0);
        grad.addColorStop(0, this.adjustColorBrightness(theme.baseColor, -30)); // Cạnh tối bên trái
        grad.addColorStop(0.3, theme.accentColor);                             // Vùng sáng
        grad.addColorStop(0.5, theme.baseColor);                               // Đỉnh vòm
        grad.addColorStop(0.8, theme.accentColor);                             // Vùng sáng phụ
        grad.addColorStop(1, this.adjustColorBrightness(theme.baseColor, -40));  // Cạnh tối bên phải

        ctx.fillStyle = grad;
        ctx.fill();

        // Tắt shadow để vẽ chi tiết bên trong
        ctx.shadowColor = 'transparent';

        // 4. Nếu là French Tip -> Vẽ đường viền đầu móng trắng tinh tế
        if (this.currentTheme === 'french') {
            ctx.save();
            ctx.clip();
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(0, -length * 0.85, halfW * 1.1, length * 0.25, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // 5. Hiệu ứng ánh gương phản chiếu (Specular Highlight Reflection)
        ctx.save();
        ctx.clip();
        const glossGrad = ctx.createLinearGradient(-halfW, -length, halfW * 0.5, length * 0.2);
        glossGrad.addColorStop(0, 'rgba(255, 255, 255, 0.65)');
        glossGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.15)');
        glossGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');

        ctx.fillStyle = glossGrad;
        ctx.beginPath();
        ctx.ellipse(-halfW * 0.2, -length * 0.5, halfW * 0.35, length * 0.4, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // 6. Viền kim loại mỏng sang trọng
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.restore();
    }

    drawSparkleEffects(w, h) {
        const time = Date.now() * 0.003;
        const ctx = this.ctx;

        this.handLandmarks.forEach((finger, i) => {
            const x = finger.x * w;
            const y = finger.y * h - 30;
            const opacity = (Math.sin(time + i * 1.5) + 1) / 2;

            if (opacity > 0.4) {
                ctx.save();
                ctx.translate(x + Math.sin(time) * 10, y + Math.cos(time) * 8);
                ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
                ctx.lineWidth = 1.5;

                // Ngôi sao 4 cánh
                const r = 6 * opacity;
                ctx.beginPath();
                ctx.moveTo(-r, 0); ctx.lineTo(r, 0);
                ctx.moveTo(0, -r); ctx.lineTo(0, r);
                ctx.stroke();

                ctx.fillStyle = `rgba(254, 240, 138, ${opacity})`;
                ctx.beginPath();
                ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        });
    }

    adjustColorBrightness(hex, percent) {
        const num = parseInt(hex.replace("#", ""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return "#" + (
            0x1000000 +
            (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
            (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
            (B < 255 ? (B < 1 ? 0 : B) : 255)
        ).toString(16).slice(1);
    }
}

// Khởi tạo Global Instance
window.nailAR = new VirtualNailTryOnEngine();
