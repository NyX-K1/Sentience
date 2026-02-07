// Configuration
const FRAME_COUNT = 40;
const FRAME_PREFIX = 'ezgif-frame-';

// State
let frames = [];
let imagesLoaded = 0;
let canvas, ctx;
let canvasWidth, canvasHeight;
let lenis;

// Animation state using GSAP
const animState = {
    frame: 0,
    targetFrame: 0
};

// Initialize
function init() {
    canvas = document.getElementById('frame-canvas');
    ctx = canvas.getContext('2d');

    // Set canvas size
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Show loading indicator
    showLoadingIndicator();

    // Preload all frames
    preloadFrames();

    // Initialize Lenis smooth scroll
    initLenis();

    // Initialize GSAP ScrollTrigger
    initScrollTrigger();

    // Start animation loop
    gsap.ticker.add(animate);
}

// Initialize Lenis smooth scroll
function initLenis() {
    lenis = new Lenis({
        duration: 0.8,        // Scroll duration - faster response
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Smooth easing
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        smoothTouch: false,   // Disable on touch devices for better performance
        touchMultiplier: 2
    });

    // Sync Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);
}

// Initialize GSAP ScrollTrigger for frame animation
function initScrollTrigger() {
    ScrollTrigger.create({
        trigger: '.scroll-spacer',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.1, // 0.1s ultra-responsive scrubbing
        onUpdate: (self) => {
            // Map scroll progress to target frame
            animState.targetFrame = self.progress * (FRAME_COUNT - 1);

            // Hide/show scroll prompt
            const scrollPrompt = document.querySelector('.scroll-prompt');
            if (self.progress > 0.05 && scrollPrompt) {
                gsap.to(scrollPrompt, { opacity: 0, duration: 0.5 });
            } else if (self.progress <= 0.05 && scrollPrompt) {
                gsap.to(scrollPrompt, { opacity: 1, duration: 0.5 });
            }
        }
    });
}

// Update canvas size to match viewport
function updateCanvasSize() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

// Show loading indicator
function showLoadingIndicator() {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.id = 'loading-indicator';
    loadingDiv.innerHTML = `
        <p>Loading Experience...</p>
        <div class="loading-bar">
            <div class="loading-progress" id="loading-progress"></div>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

// Update loading progress
function updateLoadingProgress() {
    const progress = (imagesLoaded / FRAME_COUNT) * 100;
    const progressBar = document.getElementById('loading-progress');
    if (progressBar) {
        gsap.to(progressBar, { width: progress + '%', duration: 0.3 });
    }

    // Remove loading indicator when complete
    if (imagesLoaded === FRAME_COUNT) {
        setTimeout(() => {
            const loadingIndicator = document.getElementById('loading-indicator');
            if (loadingIndicator) {
                gsap.to(loadingIndicator, {
                    opacity: 0,
                    duration: 0.5,
                    onComplete: () => loadingIndicator.remove()
                });
            }
        }, 500);
    }
}

// Preload all frame images
function preloadFrames() {
    for (let i = 1; i <= FRAME_COUNT; i++) {
        const img = new Image();
        const frameNumber = i.toString().padStart(3, '0');
        img.src = `public/${FRAME_PREFIX}${frameNumber}.jpg`;

        img.onload = () => {
            imagesLoaded++;
            updateLoadingProgress();

            // Draw first frame when loaded
            if (imagesLoaded === 1) {
                drawFrame(0);
            }
        };

        img.onerror = () => {
            console.error(`Failed to load frame ${frameNumber}`);
            imagesLoaded++;
            updateLoadingProgress();
        };

        frames.push(img);
    }
}

// Animation loop with GSAP interpolation
function animate() {
    // Use GSAP's smooth interpolation with maximum smoothing for buttery transitions
    animState.frame += (animState.targetFrame - animState.frame) * 0.35;

    // Draw the interpolated frame
    drawFrame(animState.frame);
}

// Draw frame on canvas - simplified for maximum smoothness
function drawFrame(frameIndex) {
    if (frames.length === 0) return;

    // Round to nearest frame for crisp, instant display
    const frameIndex_rounded = Math.round(frameIndex);
    const img = frames[frameIndex_rounded];

    if (!img || !img.complete) return;

    // Calculate scaling to cover the canvas while maintaining aspect ratio
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasWidth / canvasHeight;

    let drawWidth, drawHeight, offsetX, offsetY;

    if (imgAspect > canvasAspect) {
        // Image is wider than canvas
        drawHeight = canvasHeight;
        drawWidth = drawHeight * imgAspect;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
    } else {
        // Image is taller than canvas
        drawWidth = canvasWidth;
        drawHeight = drawWidth / imgAspect;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
    }

    // Apply dynamic brightness and contrast filter based on frame position
    let brightnessBoost, contrastBoost, saturationBoost;

    if (frameIndex_rounded < 10) {
        // Start frames (0-9): minimal adjustment
        brightnessBoost = 1.02;
        contrastBoost = 1.05;
        saturationBoost = 1.03;
    } else if (frameIndex_rounded >= 10 && frameIndex_rounded < 30) {
        // Middle frames (10-29): need more brightness
        const midProgress = (frameIndex_rounded - 10) / 20;
        const peakFactor = 1 - Math.abs(midProgress - 0.5) * 2;
        brightnessBoost = 1.08 + (peakFactor * 0.07);
        contrastBoost = 1.12 + (peakFactor * 0.06);
        saturationBoost = 1.08 + (peakFactor * 0.04);
    } else {
        // End frames (30-39): minimal adjustment
        brightnessBoost = 1.02;
        contrastBoost = 1.05;
        saturationBoost = 1.03;
    }

    // Apply filters and draw with copy mode for instant, flash-free rendering
    ctx.filter = `brightness(${brightnessBoost}) contrast(${contrastBoost}) saturate(${saturationBoost})`;
    ctx.globalCompositeOperation = 'copy';
    ctx.globalAlpha = 1;
    ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

    // Reset to defaults
    ctx.globalCompositeOperation = 'source-over';
    ctx.filter = 'none';
}


// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
