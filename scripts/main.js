document.addEventListener('DOMContentLoaded', () => {
    
    /* =========================================
       1. SCROLL ANIMATIONS
       ========================================= */
    // Add fade-in class to elements we want to animate
    const animatedElements = document.querySelectorAll('.project-card, .timeline-item, .skill-category, .section-title, .hero-content');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        el.classList.add('fade-in-section');
        observer.observe(el);
    });

    /* =========================================
       2. ACTIVE LINK HIGHLIGHTING
       ========================================= */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    /* =========================================
       3. MOUSE TRACKING GLOW
       ========================================= */
    const cursorGlow = document.querySelector('.cursor-glow');
    if (cursorGlow) {
        document.addEventListener('mousemove', (e) => {
            requestAnimationFrame(() => {
                cursorGlow.style.left = e.clientX + 'px';
                cursorGlow.style.top = e.clientY + 'px';
            });
        });
    }

    /* =========================================
       4. SCROLL TIMELINE PROGRESS
       ========================================= */
    const timeline = document.querySelector('.timeline');
    const timelineProgress = document.querySelector('.timeline-progress');
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    if (timeline && timelineProgress) {
        window.addEventListener('scroll', () => {
            const timelineRect = timeline.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            
            const startPoint = windowHeight / 2;
            let progress = 0;
            
            if (timelineRect.top < startPoint) {
                const scrolled = startPoint - timelineRect.top;
                progress = (scrolled / timelineRect.height) * 100;
                progress = Math.max(0, Math.min(100, progress));
            }
            
            timelineProgress.style.height = progress + '%';
            
            // Fill circles as the line hits them
            timelineItems.forEach(item => {
                const itemRect = item.getBoundingClientRect();
                // We add a slight offset (e.g. 20px) to make sure the line visually touches the circle before it fills
                if (itemRect.top <= startPoint - 20) {
                    item.classList.add('filled');
                } else {
                    item.classList.remove('filled');
                }
            });
        });
    }

    /* =========================================
       5. 3D TILT EFFECT
       ========================================= */
    const tiltElements = document.querySelectorAll('.project-card');
    
    tiltElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const tiltX = ((y - centerY) / centerY) * -5;
            const tiltY = ((x - centerX) / centerX) * 5;
            
            el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            el.style.transition = 'transform 0.5s ease-out';
            setTimeout(() => {
                el.style.transition = '';
            }, 500);
        });
    });
        
    /* =========================================
       6. PROCEDURAL PCB BACKGROUND
       ========================================= */
    const canvas = document.getElementById('pcb-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        

        let traces = [];
        let mouseX = -1000;
        let mouseY = -1000;
        let animationFrameId;

        // Utility: Distance from point p to line segment v-w
        const sqr = (x) => x * x;
        const dist2 = (v, w) => sqr(v.x - w.x) + sqr(v.y - w.y);
        const distToSegmentSquared = (p, v, w) => {
            const l2 = dist2(v, w);
            if (l2 === 0) return dist2(p, v);
            let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
            t = Math.max(0, Math.min(1, t));
            return dist2(p, { x: v.x + t * (w.x - v.x), y: v.y + t * (w.y - v.y) });
        };

        const generateTraces = () => {
            traces = [];
            const gridSize = 30;
            const cols = Math.floor(canvas.width / gridSize);
            const rows = Math.floor(canvas.height / gridSize);
            const numTraces = Math.floor((cols * rows) * 0.05); 
            
            for (let i = 0; i < numTraces; i++) {
                let x = Math.floor(Math.random() * cols) * gridSize;
                let y = Math.floor(Math.random() * rows) * gridSize;
                
                const points = [{x, y}];
                
                const isHorizontal = Math.random() > 0.5;
                const dir = Math.random() > 0.5 ? 1 : -1;
                const bendDir = Math.random() > 0.5 ? 1 : -1;
                
                const seg1 = (Math.floor(Math.random() * 4) + 1) * gridSize;
                const seg2 = (Math.floor(Math.random() * 3) + 1) * gridSize;
                const seg3 = (Math.floor(Math.random() * 4) + 1) * gridSize;
                
                if (isHorizontal) {
                    x += seg1 * dir; points.push({x, y});
                    x += seg2 * dir; y += seg2 * bendDir; points.push({x, y});
                    if (Math.random() > 0.5) x += seg3 * dir; else y += seg3 * bendDir;
                    points.push({x, y});
                } else {
                    y += seg1 * dir; points.push({x, y});
                    x += seg2 * bendDir; y += seg2 * dir; points.push({x, y});
                    if (Math.random() > 0.5) y += seg3 * dir; else x += seg3 * bendDir;
                    points.push({x, y});
                }
                
                traces.push({ points, glow: 0 });
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.lineWidth = 1.5;
            const mouseP = {x: mouseX, y: mouseY};
            
            // Draw all base traces
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.25)';
            ctx.fillStyle = 'rgba(212, 175, 55, 0.4)';
            ctx.shadowBlur = 0;
            
            traces.forEach(trace => {
                // Calculate distance
                let minDist = Infinity;
                for (let i = 0; i < trace.points.length - 1; i++) {
                    const distSq = distToSegmentSquared(mouseP, trace.points[i], trace.points[i+1]);
                    if (distSq < minDist) minDist = distSq;
                }
                
                // Update glow state (100px radius = 10000 distSq)
                if (minDist < 10000) {
                    trace.glow = Math.min(1, trace.glow + 0.1);
                } else {
                    trace.glow = Math.max(0, trace.glow - 0.02);
                }
                
                // Add to base path
                const pts = trace.points;
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x, pts[i].y);
                }
            });
            ctx.stroke();
            
            // Draw pads for base traces
            ctx.beginPath();
            traces.forEach(trace => {
                const pts = trace.points;
                ctx.moveTo(pts[0].x + 3.5, pts[0].y);
                ctx.arc(pts[0].x, pts[0].y, 3.5, 0, Math.PI * 2);
                ctx.moveTo(pts[pts.length-1].x + 3.5, pts[pts.length-1].y);
                ctx.arc(pts[pts.length-1].x, pts[pts.length-1].y, 3.5, 0, Math.PI * 2);
            });
            ctx.fill();
            
            // Draw glowing traces on top
            traces.filter(t => t.glow > 0).forEach(trace => {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 234, 0, ${trace.glow})`;
                ctx.fillStyle = `rgba(255, 234, 0, ${trace.glow})`;
                ctx.shadowColor = '#ffea00';
                ctx.shadowBlur = 10 * trace.glow;
                
                const pts = trace.points;
                ctx.moveTo(pts[0].x, pts[0].y);
                for (let i = 1; i < pts.length; i++) {
                    ctx.lineTo(pts[i].x, pts[i].y);
                }
                ctx.stroke();
                
                ctx.beginPath();
                ctx.arc(pts[0].x, pts[0].y, 3.5, 0, Math.PI * 2);
                ctx.arc(pts[pts.length-1].x, pts[pts.length-1].y, 3.5, 0, Math.PI * 2);
                ctx.fill();
            });
            
            animationFrameId = requestAnimationFrame(render);
        };

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            generateTraces();
        };

        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        // Start
        resizeCanvas();
        render();
    }
});
