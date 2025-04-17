// DOM elements
const logoElement = document.getElementById('logo');
let chefHatModel; // Reference to the chef hat 3D model

// Wait for everything to load
window.addEventListener('load', () => {
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

    // Initialize Chef Hat Animation in hero section
    initChefHatAnimation();
});

// Three.js chef hat animation
function initChefHatAnimation() {
    // Get the hero section
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    // Create container for the 3D animation
    const animationContainer = document.createElement('div');
    animationContainer.id = 'chefhat-animation';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = '100%';
    animationContainer.style.height = '100%';
    animationContainer.style.zIndex = '0'; // Behind the hero content
    animationContainer.style.pointerEvents = 'none'; // Initially disable pointer events
    
    // Insert the animation container at the beginning of the hero section
    heroSection.insertBefore(animationContainer, heroSection.firstChild);
    
    // Setup Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    animationContainer.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.0);
    mainLight.position.set(5, 5, 5);
    scene.add(mainLight);
    
    const accentLight = new THREE.DirectionalLight(0xffffff, 0.5);
    accentLight.position.set(-5, 2, -3);
    scene.add(accentLight);
    
    // Position camera
    camera.position.z = 5;
    camera.position.y = 0;
    
    // Create a loading manager
    const loadingManager = new THREE.LoadingManager();
    
    // Set up GLTF loader
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
    
    // Load chef hat model
    gltfLoader.load(
        'chef_hat.glb',  // Your local chef hat model
        function(gltf) {
            chefHatModel = gltf.scene;
            
            // Scale and position the model appropriately
            // You might need to adjust these values based on your model
            chefHatModel.scale.set(0.5, 0.5, 0.5);
            chefHatModel.position.set(0, 0, 0);
            
            // Add the model to the scene
            scene.add(chefHatModel);
            
            // Once model is loaded, enable pointer events
            animationContainer.style.pointerEvents = 'auto';
        },
        function(xhr) {
            // Progress callback
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            // Error callback
            console.error('An error happened loading the GLTF model:', error);
        }
    );
    
    // Mouse interaction variables
    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };
    let initialY = window.scrollY;
    
    // Handle mouse/touch events
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
    
    function onMouseDown(event) {
        isDragging = true;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        initialY = window.scrollY;
    }
    
    function onTouchStart(event) {
        if (event.touches.length === 1) {
            isDragging = true;
            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            initialY = window.scrollY;
        }
    }
    
    function onMouseMove(event) {
        if (!isDragging) return;
        
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        // If user is trying to scroll vertically, disable dragging
        if (Math.abs(deltaMove.y) > Math.abs(deltaMove.x) * 2) {
            isDragging = false;
            return;
        }
        
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
        
        // If user is trying to scroll vertically, disable dragging
        if (Math.abs(deltaMove.y) > Math.abs(deltaMove.x) * 2) {
            isDragging = false;
            return;
        }
        
        rotateChefHat(deltaMove);
        
        previousMousePosition = {
            x: event.touches[0].clientX,
            y: event.touches[0].clientY
        };
    }
    
    function onMouseUp() {
        isDragging = false;
    }
    
    function onTouchEnd() {
        isDragging = false;
    }
    
    function rotateChefHat(deltaMove) {
        if (!chefHatModel) return;
        
        chefHatModel.rotation.y += deltaMove.x * 0.01;
        chefHatModel.rotation.x += deltaMove.y * 0.01;
    }
    
    function animate() {
        requestAnimationFrame(animate);
        
        // Only animate if we're near the hero section (performance optimization)
        const heroRect = heroSection.getBoundingClientRect();
        const isVisible = heroRect.top < window.innerHeight && heroRect.bottom > 0;
        
        if (isVisible) {
            if (chefHatModel && !isDragging) {
                // Gentle automatic rotation
                chefHatModel.rotation.y += 0.003;
                
                // Small floating animation
                const floatY = Math.sin(Date.now() * 0.0008) * 0.2;
                chefHatModel.position.y = floatY;
            }
            
            renderer.render(scene, camera);
        }
    }
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
    });
    
    // Handle scroll events to detect if user has scrolled away from hero
    window.addEventListener('scroll', () => {
        const heroRect = heroSection.getBoundingClientRect();
        // If hero is not visible anymore, disable pointer events
        if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) {
            animationContainer.style.pointerEvents = 'none';
        } else {
            animationContainer.style.pointerEvents = 'auto';
        }
    });
    
    // Start the animation
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
    
    // Make header sticky with shadow after scrolling
    const header = document.querySelector('header');
    if (header) {
        if (scrollY > 0) {
            header.style.transform = 'translateY(0)';
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
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
                emoji.style.transform = 'scale(1.2)';
                emoji.style.transition = 'transform 0.3s ease';
            }
        });
        
        card.addEventListener('mouseout', () => {
            const emoji = card.querySelector('.product-emoji');
            if (emoji) {
                emoji.style.transform = 'scale(1)';
            }
        });
    });
});