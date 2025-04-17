// DOM elements
const loader = document.querySelector('.loader');
const logoElement = document.getElementById('logo');
let chefHat; // Reference to the chef hat 3D model

// Add session storage check to control animation display
function hasSeenAnimation() {
    return sessionStorage.getItem('hasSeenIntro') === 'true';
}

function markAnimationAsSeen() {
    sessionStorage.setItem('hasSeenIntro', 'true');
}

// Wait for everything to load
window.addEventListener('load', () => {
    // Check if user has already seen the animation
    if (hasSeenAnimation()) {
        // Hide loader immediately and show main content
        loader.style.display = 'none';
        document.querySelector('header').style.transform = 'translateY(0)';
    } else {
        // Initialize Three.js chef hat animation for first-time visitors
        initChefHatAnimation();
        
        // Add scroll event to hide intro screen
        window.addEventListener('scroll', handleIntroScroll);
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });

    // Logo animation on hover
    if (logoElement) {
        logoElement.addEventListener('mouseover', () => {
            logoElement.style.transform = 'rotate(10deg)';
        });
        
        logoElement.addEventListener('mouseout', () => {
            logoElement.style.transform = 'rotate(0deg)';
        });
    }
});

// Function to handle scroll on intro screen
function handleIntroScroll() {
    const scrollY = window.scrollY;
    const introHeight = window.innerHeight;
    
    if (scrollY > 50) {
        // Start fading out the loader/intro when scrolling starts
        loader.style.opacity = Math.max(0, 1 - (scrollY / (introHeight * 0.5)));
        
        // When scrolled past threshold, hide loader completely
        if (scrollY > introHeight * 0.5) {
            loader.style.pointerEvents = 'none';
            // Remove scroll event listener when no longer needed
            window.removeEventListener('scroll', handleIntroScroll);
            // Mark animation as seen
            markAnimationAsSeen();
        }
    }
}

// Three.js chef hat animation
function initChefHatAnimation() {
    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Enable shadows for realistic lighting
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    const animationContainer = document.getElementById('croissant-animation');
    if (animationContainer) {
        // Clear any existing content
        while(animationContainer.firstChild) {
            animationContainer.removeChild(animationContainer.firstChild);
        }
        animationContainer.appendChild(renderer.domElement);
        animationContainer.style.width = '100%';
        animationContainer.style.height = '100vh';
    }
    
    // Create a more realistic chef hat
    function createChefHat() {
        const group = new THREE.Group();
        
        // Base of the hat (cylinder with more height)
        const baseGeometry = new THREE.CylinderGeometry(1.8, 2.2, 1.2, 32);
        const baseMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xf8f8f0, // White-off color
            roughness: 0.5,
            metalness: 0.1
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.8;
        base.castShadow = true;
        base.receiveShadow = true;
        group.add(base);
        
        // Top part (puffy part) - using bezier curves for a more realistic shape
        const topShape = new THREE.Shape();
        topShape.moveTo(-2, 0);
        topShape.bezierCurveTo(-2, 1.5, -1, 3, 0, 3);
        topShape.bezierCurveTo(1, 3, 2, 1.5, 2, 0);
        topShape.lineTo(-2, 0);
        
        const extrudeSettings = {
            steps: 1,
            depth: 0.1,
            bevelEnabled: true,
            bevelThickness: 0.1,
            bevelSize: 0.1,
            bevelOffset: 0,
            bevelSegments: 10
        };
        
        // Create a revolve geometry for the top (more realistic)
        const points = [];
        for (let i = 0; i < 10; i++) {
            const t = i / 9;
            const x = 2 * (1 - Math.pow(t, 0.7)); // Shape curve for the side profile
            const y = 3 * Math.pow(t, 0.8); // Height curve
            points.push(new THREE.Vector2(x, y));
        }
        points.push(new THREE.Vector2(0, 3.5)); // Top point
        
        const topGeometry = new THREE.LatheGeometry(points, 32);
        const topMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff, // Pure white
            roughness: 0.5,
            metalness: 0.05,
            side: THREE.DoubleSide
        });
        
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0;
        top.castShadow = true;
        top.receiveShadow = true;
        group.add(top);
        
        // Add pleats/folds in the top part for realism
        const pleatCount = 12;
        const pleatMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.6,
            metalness: 0.05
        });
        
        for (let i = 0; i < pleatCount; i++) {
            const angle = (i / pleatCount) * Math.PI * 2;
            const pleatGeometry = new THREE.BoxGeometry(0.15, 2.5, 0.05);
            const pleat = new THREE.Mesh(pleatGeometry, pleatMaterial);
            
            pleat.position.x = Math.sin(angle) * 1.2;
            pleat.position.z = Math.cos(angle) * 1.2;
            pleat.position.y = 1.7;
            
            // Orient pleat to face center
            pleat.lookAt(new THREE.Vector3(0, pleat.position.y, 0));
            
            pleat.castShadow = true;
            group.add(pleat);
        }
        
        // Add a rim at the bottom with more detailed geometry
        const rimGeometry = new THREE.TorusGeometry(2.1, 0.15, 16, 32);
        const rimMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0f0f0,
            roughness: 0.5,
            metalness: 0.1
        });
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.x = Math.PI / 2;
        rim.position.y = -1.35;
        rim.castShadow = true;
        rim.receiveShadow = true;
        group.add(rim);
        
        // Add subtle texture - small details on the hat
        const detailGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const detailMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            roughness: 0.3,
            metalness: 0.2
        });
        
        // Add a small decorative button on top
        const topButton = new THREE.Mesh(detailGeometry, detailMaterial);
        topButton.scale.set(1.5, 1, 1.5);
        topButton.position.y = 3.5;
        topButton.castShadow = true;
        group.add(topButton);
        
        return group;
    }
    
    // Create the chef hat
    chefHat = createChefHat();
    scene.add(chefHat);
    
    // Add warm lighting for a bakery feel
    
    // Soft ambient light
    const ambientLight = new THREE.AmbientLight(0xffead7, 0.4); // Warm ambient
    scene.add(ambientLight);
    
    // Main warm directional light (like morning sunlight)
    const mainLight = new THREE.DirectionalLight(0xffd9b3, 0.8); // Warm yellow-orange
    mainLight.position.set(5, 8, 5);
    mainLight.castShadow = true;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 20;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);
    
    // Secondary fill light (cooler tone for contrast)
    const fillLight = new THREE.DirectionalLight(0xe1f5fe, 0.3); // Slight blue tint
    fillLight.position.set(-5, 3, -5);
    scene.add(fillLight);
    
    // Warm spotlight from the top
    const spotLight = new THREE.SpotLight(0xffb74d, 1); // Warm orange
    spotLight.position.set(0, 10, 0);
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 1.5;
    spotLight.distance = 20;
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 1024;
    spotLight.shadow.mapSize.height = 1024;
    scene.add(spotLight);
    
    // Ground plane to catch shadows (invisible)
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 0.1,
        roughness: 1
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -3;
    ground.receiveShadow = true;
    scene.add(ground);
    
    // Position camera
    camera.position.z = 8;
    camera.position.y = 0;
    
    // Add down arrow
    const arrowContainer = document.createElement('div');
    arrowContainer.className = 'scroll-arrow';
    arrowContainer.innerHTML = '↓';
    arrowContainer.style.opacity = '0';
    document.querySelector('.loader-content').appendChild(arrowContainer);
    
    // Fade in the arrow after a delay
    setTimeout(() => {
        arrowContainer.style.transition = 'opacity 1s ease';
        arrowContainer.style.opacity = '1';
    }, 2000);
    
    // Mouse interaction variables
    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };
    
    // Handle mouse/touch events
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
    
    function onMouseDown(event) {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        event.preventDefault();
    }
    
    function onTouchStart(event) {
        if (event.touches.length === 1) {
            isDragging = true;
            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
        }
        event.preventDefault();
    }
    
    function onMouseMove(event) {
        if (!isDragging) return;
        
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        rotateChefHat(deltaMove);
        
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    function onTouchMove(event) {
        if (!isDragging || event.touches.length !== 1) return;
        
        const deltaMove = {
            x: event.touches[0].clientX - previousMousePosition.x,
            y: event.touches[0].clientY - previousMousePosition.y
        };
        
        rotateChefHat(deltaMove);
        
        previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
        
        event.preventDefault();
    }
    
    function onMouseUp() {
        isDragging = false;
    }
    
    function onTouchEnd() {
        isDragging = false;
    }
    
    function rotateChefHat(deltaMove) {
        chefHat.rotation.y += deltaMove.x * 0.01;
        chefHat.rotation.x = Math.max(-0.5, Math.min(0.5, chefHat.rotation.x + deltaMove.y * 0.01));
    }
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Levitation animation
        if (chefHat) {
            // Only apply automatic animation when not being dragged
            if (!isDragging) {
                // Gentle rotation
                chefHat.rotation.y += 0.005;
                
                // Floating up and down effect with smoother motion
                const time = Date.now() * 0.001;
                const floatY = Math.sin(time * 0.7) * 0.15;
                chefHat.position.y = floatY;
                
                // Add subtle breathe effect
                const breatheScale = 1 + Math.sin(time * 0.5) * 0.02;
                chefHat.scale.set(breatheScale, breatheScale, breatheScale);
            }
            
            // Always add a slight wobble for realism
            chefHat.rotation.z = Math.sin(Date.now() * 0.0008) * 0.03;
        }
        
        // Moving light effect (like a soft glow moving around)
        spotLight.position.x = Math.sin(Date.now() * 0.0005) * 3;
        spotLight.position.z = Math.cos(Date.now() * 0.0005) * 3;
        
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    });
    
    animate();
}

// Handle scroll events for parallax
window.addEventListener('scroll', () => {
    // Add a subtle parallax effect on scroll
    const scrollY = window.scrollY;
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        heroSection.style.backgroundPositionY = -scrollY * 0.2 + 'px';
    }
    
    // Make header sticky with shadow only after scrolling past intro
    const header = document.querySelector('header');
    if (header) {
        if (!hasSeenAnimation()) {
            // First-time visitor behavior
            if (scrollY > window.innerHeight) {
                header.style.transform = 'translateY(0)';
            } else {
                header.style.transform = 'translateY(-100%)';
            }
        } else {
            // Return visitor behavior - header always visible
            header.style.transform = 'translateY(0)';
        }
    }
});

// When the DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create a subtle animation for the products on hover
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseover', () => {
            const emoji = card.querySelector('.product-emoji');
            if (emoji) {
                emoji.style.transform = 'scale(1.2) rotate(10deg)';
                emoji.style.transition = 'transform 0.3s ease';
            }
            
            // Add subtle glow effect
            card.style.boxShadow = '0 5px 15px rgba(255, 180, 0, 0.2)';
            card.style.transition = 'box-shadow 0.3s ease, transform 0.3s ease';
            card.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseout', () => {
            const emoji = card.querySelector('.product-emoji');
            if (emoji) {
                emoji.style.transform = 'scale(1) rotate(0)';
            }
            
            // Remove glow effect
            card.style.boxShadow = '';
            card.style.transform = '';
        });
    });
});