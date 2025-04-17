// DOM elements
const logoElement = document.getElementById('logo');
let chefHatModel;
let rotationVelocity = { x: 0, y: 0 };
let lastTime = 0;

window.addEventListener('load', () => {
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

    document.querySelectorAll('section').forEach(section => {
        section.style.opacity = 0;
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });

    if (logoElement) {
        logoElement.addEventListener('mouseover', () => {
            logoElement.style.transform = 'rotate(10deg)';
        });
        
        logoElement.addEventListener('mouseout', () => {
            logoElement.style.transform = 'rotate(0deg)';
        });
    }

    initChefHatAnimation();

    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        const scrollArrow = document.createElement('div');
        scrollArrow.className = 'scroll-arrow';
        heroSection.appendChild(scrollArrow);
        
        scrollArrow.addEventListener('click', function() {
            const nouveautesSection = document.querySelector('#featured');
            if (nouveautesSection) {
                const headerOffset = document.querySelector('header').offsetHeight;
                const elementPosition = nouveautesSection.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
});

function initChefHatAnimation() {
    const heroSection = document.querySelector('.hero');
    if (!heroSection) return;
    
    const animationContainer = document.createElement('div');
    animationContainer.id = 'chefhat-animation';
    animationContainer.style.position = 'absolute';
    animationContainer.style.top = '0';
    animationContainer.style.left = '0';
    animationContainer.style.width = '100%';
    animationContainer.style.height = '100%';
    animationContainer.style.zIndex = '0';
    animationContainer.style.pointerEvents = 'none';
    
    heroSection.insertBefore(animationContainer, heroSection.firstChild);
    
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    animationContainer.appendChild(renderer.domElement);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(5, 5, 5);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 50;
    scene.add(mainLight);
    
    const accentLight = new THREE.DirectionalLight(0xffebcd, 0.6);
    accentLight.position.set(-5, 2, -3);
    scene.add(accentLight);
    
    const rimLight = new THREE.SpotLight(0xf5deb3, 0.8);
    rimLight.position.set(0, -3, 5);
    rimLight.angle = Math.PI / 4;
    rimLight.penumbra = 0.5;
    rimLight.castShadow = true;
    scene.add(rimLight);
    
    camera.position.z = 5;
    camera.position.y = 0;
    
    const loadingManager = new THREE.LoadingManager();
    
    const gltfLoader = new THREE.GLTFLoader(loadingManager);
    
    gltfLoader.load(
        'chef_hat.glb',
        function(gltf) {
            chefHatModel = gltf.scene;
            if (window.innerWidth <= 767) {
                chefHatModel.scale.set(2.7, 2.7, 2.7);
                chefHatModel.position.set(0, 0.5, 0);
            } else {
                chefHatModel.scale.set(5.0, 5.0, 5.0);
                chefHatModel.position.set(0, -1, 0);
            }
            
            chefHatModel.rotation.x = -0.3; 
            chefHatModel.rotation.y = 0.1;
            chefHatModel.rotation.z = 0.15;
            
            chefHatModel.traverse(function(node) {
                if (node.isMesh) {
                    node.castShadow = true;
                    node.receiveShadow = true;
                }
            });
            scene.add(chefHatModel);
            animationContainer.style.pointerEvents = 'auto';
        },
        function(xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function(error) {
            console.error('An error happened loading the GLTF model:', error);
        }
    );
    
    let isDragging = false;
    let previousMousePosition = {
        x: 0,
        y: 0
    };
    let dragStartTime = 0;
    let lastDragTime = 0;
    let initialY = window.scrollY;
    
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    renderer.domElement.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onTouchEnd);
    
    function onMouseDown(event) {
        event.preventDefault();
        isDragging = true;
        dragStartTime = Date.now();
        lastDragTime = dragStartTime;
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
        initialY = window.scrollY;
        rotationVelocity = { x: 0, y: 0 };
    }
    
    function onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            isDragging = true;
            dragStartTime = Date.now();
            lastDragTime = dragStartTime;
            previousMousePosition = {
                x: event.touches[0].clientX,
                y: event.touches[0].clientY
            };
            initialY = window.scrollY;
            rotationVelocity = { x: 0, y: 0 };
        }
    }
    
    function onMouseMove(event) {
        if (!isDragging) return;
        
        const now = Date.now();
        const deltaTime = (now - lastDragTime) / 1000;
        lastDragTime = now;
        
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };
        
        if (Math.abs(deltaMove.y) > Math.abs(deltaMove.x) * 2) {
            isDragging = false;
            return;
        }
        
        if (deltaTime > 0) {
            rotationVelocity = {
                x: deltaMove.y * 0.01 / deltaTime,
                y: deltaMove.x * 0.01 / deltaTime
            };
            
            rotateChefHat(deltaMove);
        }
        
        previousMousePosition = {
            x: event.clientX,
            y: event.clientY
        };
    }
    
    function onTouchMove(event) {
        if (!isDragging || event.touches.length !== 1) return;
        
        const touchY = event.touches[0].clientY;
        const touchDeltaY = Math.abs(touchY - previousMousePosition.y);
        const touchX = event.touches[0].clientX;
        const touchDeltaX = Math.abs(touchX - previousMousePosition.x);
        
        if (touchDeltaY > touchDeltaX * 1.5 && touchDeltaY > 10) {
            isDragging = false;
            return;
        }
        
        event.preventDefault();
        
        const now = Date.now();
        const deltaTime = (now - lastDragTime) / 1000;
        lastDragTime = now;
        
        const deltaMove = {
            x: touchX - previousMousePosition.x,
            y: touchY - previousMousePosition.y
        };
        
        if (deltaTime > 0) {
            rotationVelocity = {
                x: deltaMove.y * 0.01 / deltaTime,
                y: deltaMove.x * 0.01 / deltaTime
            };
            
            rotateChefHat(deltaMove);
        }
        
        previousMousePosition = {
            x: touchX,
            y: touchY
        };
    }
    
    function onMouseUp(event) {
        isDragging = false;
    }
    
    function onTouchEnd(event) {
        isDragging = false;
    }
    
    function rotateChefHat(deltaMove) {
        if (!chefHatModel) return;
        
        chefHatModel.rotation.y += deltaMove.x * 0.01;
        chefHatModel.rotation.x = Math.max(-0.5, Math.min(0.5, chefHatModel.rotation.x + deltaMove.y * 0.01));
    }
    
    function animate(time) {
        requestAnimationFrame(animate);
        
        const deltaTime = (time - lastTime) / 1000;
        lastTime = time;
        
        const heroRect = heroSection.getBoundingClientRect();
        const isVisible = heroRect.top < window.innerHeight && heroRect.bottom > 0;
        
        if (isVisible) {
            if (chefHatModel && !isDragging) {
                const friction = 0.95;
                
                rotationVelocity.x *= friction;
                rotationVelocity.y *= friction;
                
                if (Math.abs(rotationVelocity.x) > 0.001 || Math.abs(rotationVelocity.y) > 0.001) {
                    chefHatModel.rotation.x = Math.max(-0.5, Math.min(0.5, chefHatModel.rotation.x + rotationVelocity.x * deltaTime));
                    chefHatModel.rotation.y += rotationVelocity.y * deltaTime;
                } else {
                    rotationVelocity.x = 0;
                    rotationVelocity.y = 0;
                }
                
                const autoRotationSpeed = 0.2;
                if (Math.abs(rotationVelocity.y) < 0.1) {
                    chefHatModel.rotation.y += autoRotationSpeed * deltaTime;
                }
                
                const floatY = Math.sin(time * 0.001) * 0.1;
                const baseY = window.innerWidth <= 767 ? 0.3 : -0.7;
                chefHatModel.position.y = floatY + baseY; 
            }
            
            renderer.render(scene, camera);
        }
    }
    
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        
        renderer.setSize(width, height);
        
        if (chefHatModel) {
            if (width <= 767) {
                chefHatModel.scale.set(2.7, 2.7, 2.7);
                chefHatModel.position.set(0, 0.5, 0);
            } else {
                chefHatModel.scale.set(5.0, 5.0, 5.0);
                chefHatModel.position.set(0, -1.0, 0);
            }
        }
    });
    
    window.addEventListener('scroll', () => {
        const heroRect = heroSection.getBoundingClientRect();
        if (heroRect.bottom < 0 || heroRect.top > window.innerHeight) {
            animationContainer.style.pointerEvents = 'none';
        } else {
            animationContainer.style.pointerEvents = 'auto';
        }
    });
    
    animate(0);
}

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const heroSection = document.querySelector('.hero');
    
    if (heroSection) {
        heroSection.style.backgroundPositionY = -scrollY * 0.2 + 'px';
        
        // Masquer la flèche de défilement lorsque l'utilisateur commence à défiler
        const scrollArrow = document.querySelector('.scroll-arrow');
        if (scrollArrow && scrollY > 50) {
            scrollArrow.style.opacity = '0';
        } else if (scrollArrow) {
            scrollArrow.style.opacity = '1';
        }
    }
    
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

document.addEventListener('DOMContentLoaded', () => {
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