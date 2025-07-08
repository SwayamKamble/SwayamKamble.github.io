// Enhanced space background with moving galaxies and nebulas

class SpaceBackground {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.stars = [];
    this.comets = [];
    this.galaxies = [];
    this.nebulas = [];
    this.shootingStars = [];
    this.lastShootingStarTime = 0;
    this.isMobile = window.innerWidth <= 768;
    this.rotation = 0;
    this.rotationSpeed = 0.0003; // Increased speed for more noticeable effect
    this.isIndexPage = this.checkIfIndexPage();
    
    this.astronaut = {
      x: 0,
      y: 0,
      size: this.isMobile ? 30 : 40,
      angle: 0,
      speed: 0.5,
      orbit: this.isMobile ? 100 : 150,
      centerX: 0,
      centerY: 0,
      img: new Image()
    };
    
    // Replace the fixed interval with a more random approach
    this.shootingStarInterval = 200 + Math.random() * 800; // Random interval between 200-1000ms
    
    // Create a shooting star with dynamic timing
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastShootingStarTime > this.shootingStarInterval && this.shootingStars.length < 10) {
        this.createShootingStar();
        this.lastShootingStarTime = now;
        // Set a new random interval for next star
        this.shootingStarInterval = 200 + Math.random() * 1500;
      }
    }, 100); // Check more frequently, but create based on dynamic interval
    
    this.init();
  }
  
  // Add method to check if we're on index page
  checkIfIndexPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page === '' || page === 'index.html' || path.endsWith('/');
  }
  
  init() {
    // Set up canvas with stronger positioning
    this.canvas.id = 'space-background';
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';  // Use viewport units instead of percentage
    this.canvas.style.height = '100vh';
    this.canvas.style.zIndex = '-1';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.willChange = 'transform'; // Optimization for fixed elements
    document.body.prepend(this.canvas);
    
    // Set canvas size
    this.resizeCanvas();
    
    // Add event listeners for resize and scroll
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Add scroll event listener with throttling to prevent performance issues
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      if (!scrollTimeout) {
        scrollTimeout = setTimeout(() => {
          this.handleScroll();
          scrollTimeout = null;
        }, 10); // Small delay to avoid too many calls
      }
    }, { passive: true });
    
    // Force redraw on resize and orientation change
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.forceRedraw();
    });
    
    window.addEventListener('orientationchange', () => {
      setTimeout(() => {
        this.resizeCanvas();
        this.forceRedraw();
      }, 200);
    });
    
    // Set up visibility change detection to handle tab switching
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.forceRedraw();
      }
    });
    
    // Periodic check to ensure canvas is visible (fallback for mobile)
    setInterval(() => this.ensureCanvasVisible(), 2000);
    
    // Create stars
    this.createStars(this.isMobile ? 100 : 100);
    
    // Create comets
    this.createComets(this.isMobile ? 2 : 3);
    
    // Create galaxies
    this.createGalaxies(this.isMobile ? 2 : 3);
    
    // Create nebulas (new)
    this.createNebulas(this.isMobile ? 2 : 4);
    
    // Set up astronaut
    this.astronaut.img.src = 'images/astronaut.png';
    this.astronaut.centerX = window.innerWidth * 0.8;
    this.astronaut.centerY = window.innerHeight * 0.7;
    
    // Start animation
    this.animate();
  }
  
  resizeCanvas() {
    // Ensure canvas covers the entire viewport
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Reset canvas position to cover entire viewport
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    
    // Reposition elements after resize
    this.repositionElements();
    
    // Check if device type changed
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== this.isMobile) {
      this.adjustForDeviceType();
    }
  }
  
  // Add a new method to force redraw
  forceRedraw() {
    // Clear and immediately redraw all elements
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawNebulas();
    this.drawGalaxies();
    this.drawStars();
    this.drawComets();
    this.drawShootingStars();
    this.drawAstronaut();
  }
  
  // Add a new method to ensure canvas is visible
  ensureCanvasVisible() {
    const canvas = document.getElementById('space-background');
    
    // If canvas is missing, add it back
    if (!canvas) {
      document.body.prepend(this.canvas);
      this.forceRedraw();
      return;
    }
    
    // Fix any positioning issues
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '-1';
    
    // On some mobile browsers, transform: translate3d(0,0,0) can help
    // with rendering issues by forcing hardware acceleration
    canvas.style.transform = 'translate3d(0,0,0)';
    
    // Ensure it's properly appended as the first child if out of place
    if (document.body.firstChild !== canvas) {
      document.body.prepend(canvas);
    }
  }
  
  handleScroll() {
    // Fix for mobile scroll disappearing issue
    if (this.isMobile) {
      // Reset positioning to ensure the canvas stays fixed
      this.canvas.style.position = 'fixed';
      this.canvas.style.top = '0';
      this.canvas.style.left = '0';
      this.canvas.style.transform = 'translate3d(0,0,0)';
      
      // Force a partial redraw on scroll to keep animation smooth
      if (Math.random() < 0.2) { // Only redraw occasionally to maintain performance
        this.forceRedraw();
      }
    }
  }
  
  repositionElements() {
    // Reposition elements relative to current viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Ensure astronaut stays in visible area
    this.astronaut.centerX = viewportWidth * 0.8;
    this.astronaut.centerY = viewportHeight * 0.7;
    
    // Ensure some galaxies and nebulas are always in the viewport
    this.ensureVisibleElements();
  }
  
  ensureVisibleElements() {
    // Make sure at least one galaxy and nebula are visible in current viewport
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    
    // Check if any galaxies are visible
    let hasVisibleGalaxy = false;
    for (const galaxy of this.galaxies) {
      if (galaxy.x > 0 && galaxy.x < viewportWidth && galaxy.y > 0 && galaxy.y < viewportHeight) {
        hasVisibleGalaxy = true;
        break;
      }
    }
    
    // If no galaxies visible, reposition one
    if (!hasVisibleGalaxy && this.galaxies.length > 0) {
      const galaxy = this.galaxies[0];
      galaxy.x = viewportWidth * 0.5;
      galaxy.y = viewportHeight * 0.3;
    }
    
    // Check if any nebulas are visible
    let hasVisibleNebula = false;
    for (const nebula of this.nebulas) {
      if (nebula.x > 0 && nebula.x < viewportWidth && nebula.y > 0 && nebula.y < viewportHeight) {
        hasVisibleNebula = true;
        break;
      }
    }
    
    // If no nebulas visible, reposition one
    if (!hasVisibleNebula && this.nebulas.length > 0) {
      const nebula = this.nebulas[0];
      nebula.x = viewportWidth * 0.7;
      nebula.y = viewportHeight * 0.6;
    }
  }
  
  createStars(count) {
    this.stars = [];
    for (let i = 0; i < count; i++) {
      this.stars.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: Math.random() > 0.9 ? this.getRandomStarColor() : '#FFFFFF'
      });
    }
  }
  
  getRandomStarColor() {
    const colors = ['#FFFFFF', '#F8F7FF', '#CAE9FF', '#FFF8E7', '#FFE9C8', '#FFDAB9'];
    return colors[Math.floor(Math.random() * colors.length)];
  }
  
  createComets(count) {
    this.comets = [];
    for (let i = 0; i < count; i++) {
      this.comets.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        length: Math.random() * 100 + 50,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 2 + 1,
        width: Math.random() * 2 + 1,
        active: false,
        countdown: Math.floor(Math.random() * 300) + 100
      });
    }
  }
  
  // Enhanced shooting star creation with more random patterns
  createShootingStar() {
    // Determine random edge for star to start from (0=top, 1=right, 2=bottom, 3=left)
    const edge = Math.floor(Math.random() * 4);
    
    // Random position along the chosen edge
    let x, y, angle, speed, size;
    
    // Increased speed variation
    speed = 3 + Math.random() * 10;
    
    // Varied sizes
    size = 1 + Math.random() * 3;
    
    // Random colors with preference for white/blue tints
    const colorChoices = [
      '#FFFFFF', // White
      '#F8F7FF', // Slightly blue white
      '#E6EEFF', // Light blue
      '#FFE9C8', // Warm white
      '#CAE9FF', // Pale blue
      '#E6E6FA'  // Lavender
    ];
    
    const color = colorChoices[Math.floor(Math.random() * colorChoices.length)];
    
    // Calculate random position and trajectory based on starting edge
    switch(edge) {
      case 0: // Top edge
        x = Math.random() * this.canvas.width;
        y = -20; // Start slightly off-screen
        angle = (Math.PI / 4) + (Math.random() * Math.PI / 2); // Downward with variation
        break;
      case 1: // Right edge
        x = this.canvas.width + 20; // Start slightly off-screen
        y = Math.random() * this.canvas.height;
        angle = Math.PI * 0.75 + (Math.random() * Math.PI / 2); // Leftward with variation
        break;
      case 2: // Bottom edge
        x = Math.random() * this.canvas.width;
        y = this.canvas.height + 20; // Start slightly off-screen
        angle = -Math.PI / 4 - (Math.random() * Math.PI / 2); // Upward with variation
        break;
      case 3: // Left edge
        x = -20; // Start slightly off-screen
        y = Math.random() * this.canvas.height;
        angle = -Math.PI * 0.25 - (Math.random() * Math.PI / 2); // Rightward with variation
        break;
    }
    
    // Add a bit of curve to some shooting stars for more natural trajectories
    const hasCurve = Math.random() > 0.7;
    const curveRate = (Math.random() * 0.02 - 0.01) * (Math.random() > 0.5 ? 1 : -1);
    
    // Create the shooting star with enhanced properties
    this.shootingStars.push({
      x,
      y,
      trailPoints: [{x, y}], // Start with initial position
      angle,
      speed,
      size,
      brightness: 0.7 + Math.random() * 0.3, // Brighter stars
      trailLength: 15 + Math.random() * 35, // Longer, more variable trails
      color,
      alive: true,
      flicker: Math.random() > 0.6, // Some stars flicker
      flickerRate: 0.1 + Math.random() * 0.2,
      hasCurve,
      curveRate,
      // Add a slight delay before some stars start moving
      delayStart: Math.random() > 0.8 ? Math.random() * 1000 : 0,
      startTime: Date.now()
    });
  }
  
  // Enhanced draw method for more impressive shooting stars
  drawShootingStars() {
    const now = Date.now();
    
    // For each shooting star
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const star = this.shootingStars[i];
      
      // Skip if star is delayed
      if (now - star.startTime < star.delayStart) {
        continue;
      }
      
      // Update position
      star.x += Math.cos(star.angle) * star.speed;
      star.y += Math.sin(star.angle) * star.speed;
      
      // Apply curve if star has curved trajectory
      if (star.hasCurve) {
        star.angle += star.curveRate;
      }
      
      // Add current position to trail
      star.trailPoints.push({x: star.x, y: star.y});
      
      // Limit trail length
      while (star.trailPoints.length > star.trailLength) {
        star.trailPoints.shift();
      }
      
      // Check if shooting star is out of bounds
      if (star.x < -100 || star.x > this.canvas.width + 100 || 
          star.y < -100 || star.y > this.canvas.height + 100) {
        star.alive = false;
      }
      
      // Draw shooting star
      if (star.alive) {
        this.ctx.save();
        
        // Apply flickering effect if enabled
        let brightness = star.brightness;
        if (star.flicker) {
          brightness *= 0.6 + Math.abs(Math.sin(Date.now() * star.flickerRate)) * 0.4;
        }
        
        // Draw trail with smoother gradient
        if (star.trailPoints.length > 1) {
          // Create gradient for trail
          const gradient = this.ctx.createLinearGradient(
            star.trailPoints[0].x, star.trailPoints[0].y,
            star.x, star.y
          );
          
          // Parse the star's color to use in the gradient
          const rgbColor = this.hexToRgb(star.color || '#FFFFFF');
          
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0)');
          gradient.addColorStop(0.1, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${brightness * 0.1})`);
          gradient.addColorStop(0.4, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${brightness * 0.3})`);
          gradient.addColorStop(0.8, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${brightness * 0.7})`);
          gradient.addColorStop(1, `rgba(255, 255, 255, ${brightness})`);
          
          // Draw the trail as a smooth curve
          this.ctx.beginPath();
          this.ctx.moveTo(star.trailPoints[0].x, star.trailPoints[0].y);
          
          // Use a curve instead of straight line segments for smoother trail
          if (star.trailPoints.length > 2) {
            for (let i = 1; i < star.trailPoints.length - 1; i++) {
              const xc = (star.trailPoints[i].x + star.trailPoints[i+1].x) / 2;
              const yc = (star.trailPoints[i].y + star.trailPoints[i+1].y) / 2;
              this.ctx.quadraticCurveTo(star.trailPoints[i].x, star.trailPoints[i].y, xc, yc);
            }
            
            // Connect to the last point
            this.ctx.lineTo(star.trailPoints[star.trailPoints.length-1].x, star.trailPoints[star.trailPoints.length-1].y);
          } else {
            // If not enough points for curve, use a line
            for (let i = 1; i < star.trailPoints.length; i++) {
              this.ctx.lineTo(star.trailPoints[i].x, star.trailPoints[i].y);
            }
          }
          
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = star.size;
          this.ctx.lineCap = 'round';
          this.ctx.stroke();
        }
        
        // Draw the star point (head) with glow effect
        this.ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 1.5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Enhanced glow effect
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
        const glow = this.ctx.createRadialGradient(
          star.x, star.y, star.size * 0.5,
          star.x, star.y, star.size * 4
        );
        glow.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.4})`);
        glow.addColorStop(0.5, `rgba(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b}, ${brightness * 0.1})`);
        glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
        this.ctx.fillStyle = glow;
        this.ctx.fill();
        
        this.ctx.restore();
      } else {
        // Remove dead shooting stars
        this.shootingStars.splice(i, 1);
      }
    }
  }
  
  // Helper function to convert hex to RGB
  hexToRgb(hex) {
    // Default to white if no color is provided
    if (!hex) return { r: 255, g: 255, b: 255 };
    
    // Remove # if present
    hex = hex.replace('#', '');
    
    // Handle shorthand hex
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    
    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }
  
  createGalaxies(count) {
    this.galaxies = [];
    
    // More varied colors for realistic galaxies
    const coreColors = [
      'rgba(106, 13, 173, 0.5)', // Purple
      'rgba(147, 112, 219, 0.5)', // Medium purple
      'rgba(70, 10, 100, 0.5)',  // Dark purple
      'rgba(50, 20, 150, 0.5)',  // Blue-purple
      'rgba(200, 50, 200, 0.4)'  // Pink-purple
    ];
    
    const dustColors = [
      'rgba(106, 13, 173, 0.1)',
      'rgba(147, 112, 219, 0.1)',
      'rgba(75, 0, 130, 0.1)',
      'rgba(180, 100, 200, 0.1)',
      'rgba(50, 30, 100, 0.1)'
    ];
    
    for (let i = 0; i < count; i++) {
      this.galaxies.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * (this.isMobile ? 200 : 300) + (this.isMobile ? 150 : 200), // Smaller on mobile
        rotation: Math.random() * Math.PI * 2,
        coreColor: coreColors[Math.floor(Math.random() * coreColors.length)],
        dustColor: dustColors[Math.floor(Math.random() * dustColors.length)],
        rotationSpeed: (Math.random() * 0.0003) + 0.0001,
        spiralFactor: 0.2 + Math.random() * 0.3,
        arms: 2 + Math.floor(Math.random() * 3) * 2,
        ellipticity: 0.5 + Math.random() * 0.3,
        vx: (Math.random() * 0.2 - 0.1) * 0.2,
        vy: (Math.random() * 0.2 - 0.1) * 0.2,
        scaleDirection: Math.random() > 0.5 ? 1 : -1,
        scaleAmount: 1,
        scaleSpeed: Math.random() * 0.0005 + 0.0002
      });
    }
  }
  
  // New method to create nebulas
  createNebulas(count) {
    this.nebulas = [];
    
    // Nebula colors with transparency
    const nebulaColors = [
      ['rgba(130, 20, 220, 0.2)', 'rgba(90, 10, 160, 0.05)'], // Purple
      ['rgba(20, 50, 180, 0.2)', 'rgba(10, 30, 120, 0.05)'],  // Blue
      ['rgba(180, 50, 130, 0.2)', 'rgba(120, 20, 80, 0.05)'], // Pink
      ['rgba(30, 80, 130, 0.2)', 'rgba(10, 40, 90, 0.05)']    // Teal
    ];
    
    for (let i = 0; i < count; i++) {
      const colorSet = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      const size = Math.random() * (this.isMobile ? 300 : 400) + (this.isMobile ? 200 : 300); // Smaller on mobile
      
      this.nebulas.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: size,
        innerColor: colorSet[0],
        outerColor: colorSet[1],
        points: this.generateNebulaPoints(10 + Math.floor(Math.random() * 8), 0.3 + Math.random() * 0.4),
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() * 0.0002) + 0.00005,
        vx: (Math.random() * 0.15 - 0.075) * 0.2, // Velocity x (very slow)
        vy: (Math.random() * 0.15 - 0.075) * 0.2, // Velocity y (very slow)
        timeOffset: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.001 + 0.0005
      });
    }
  }
  
  // Helper method to generate random shapes for nebulas
  generateNebulaPoints(count, irregularity) {
    const points = [];
    const angleStep = (Math.PI * 2) / count;
    
    for (let i = 0; i < count; i++) {
      const angle = i * angleStep;
      const distance = 1 - (Math.random() * irregularity);
      
      points.push({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    }
    
    return points;
  }
  
  drawStars() {
    this.ctx.save();
    for (const star of this.stars) {
      // Update twinkle
      star.twinklePhase += star.twinkleSpeed;
      const opacity = star.opacity * (0.7 + 0.3 * Math.sin(star.twinklePhase));
      
      // Draw star
      this.ctx.fillStyle = star.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
      this.ctx.beginPath();
      this.ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }
  
  drawComets() {
    this.ctx.save();
    for (const comet of this.comets) {
      // Update comet
      if (comet.active) {
        comet.x += Math.cos(comet.angle) * comet.speed;
        comet.y += Math.sin(comet.angle) * comet.speed;
        
        // Check if comet is out of canvas
        if (comet.x < -comet.length || comet.x > this.canvas.width + comet.length ||
            comet.y < -comet.length || comet.y > this.canvas.height + comet.length) {
          comet.active = false;
          comet.countdown = Math.floor(Math.random() * 300) + 100;
        }
      } else {
        comet.countdown--;
        if (comet.countdown <= 0) {
          // Reset comet
          if (Math.random() < 0.5) {
            // Start from edge
            if (Math.random() < 0.5) {
              // Left or right
              comet.x = Math.random() < 0.5 ? 0 : this.canvas.width;
              comet.y = Math.random() * this.canvas.height;
              comet.angle = comet.x === 0 ? 
                Math.random() * Math.PI / 2 - Math.PI / 4 : 
                Math.random() * Math.PI / 2 + Math.PI * 3/4;
            } else {
              // Top or bottom
              comet.x = Math.random() * this.canvas.width;
              comet.y = Math.random() < 0.5 ? 0 : this.canvas.height;
              comet.angle = comet.y === 0 ? 
                Math.random() * Math.PI / 2 + Math.PI / 4 : 
                Math.random() * Math.PI / 2 - Math.PI * 3/4;
            }
          } else {
            // Random position
            comet.x = Math.random() * this.canvas.width;
            comet.y = Math.random() * this.canvas.height;
            comet.angle = Math.random() * Math.PI * 2;
          }
          
          comet.active = true;
          comet.length = Math.random() * 100 + 50;
          comet.speed = Math.random() * 2 + 1;
          comet.width = Math.random() * 2 + 1;
        }
      }
      
      // Draw comet
      if (comet.active) {
        const gradient = this.ctx.createLinearGradient(
          comet.x, comet.y,
          comet.x - Math.cos(comet.angle) * comet.length,
          comet.y - Math.sin(comet.angle) * comet.length
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(0.3, 'rgba(180, 180, 255, 0.6)');
        gradient.addColorStop(1, 'rgba(147, 112, 219, 0)');
        
        this.ctx.strokeStyle = gradient;
        this.ctx.lineWidth = comet.width;
        this.ctx.beginPath();
        this.ctx.moveTo(comet.x, comet.y);
        this.ctx.lineTo(
          comet.x - Math.cos(comet.angle) * comet.length,
          comet.y - Math.sin(comet.angle) * comet.length
        );
        this.ctx.stroke();
      }
    }
    this.ctx.restore();
  }
  
  drawGalaxies() {
    this.ctx.save();
    
    for (const galaxy of this.galaxies) {
      // Update rotation
      galaxy.rotation += galaxy.rotationSpeed;
      
      // Update position with smooth movement
      galaxy.x += galaxy.vx;
      galaxy.y += galaxy.vy;
      
      // Update scale pulsing effect
      galaxy.scaleAmount += galaxy.scaleSpeed * galaxy.scaleDirection;
      if (galaxy.scaleAmount > 1.05) {
        galaxy.scaleDirection = -1;
      } else if (galaxy.scaleAmount < 0.95) {
        galaxy.scaleDirection = 1;
      }
      
      // Wrap around edges (with buffer so they disappear/appear smoothly)
      if (galaxy.x < -galaxy.size) galaxy.x = this.canvas.width + galaxy.size;
      if (galaxy.x > this.canvas.width + galaxy.size) galaxy.x = -galaxy.size;
      if (galaxy.y < -galaxy.size) galaxy.y = this.canvas.height + galaxy.size;
      if (galaxy.y > this.canvas.height + galaxy.size) galaxy.y = -galaxy.size;
      
      // Draw galaxy
      this.ctx.translate(galaxy.x, galaxy.y);
      this.ctx.rotate(galaxy.rotation);
      this.ctx.scale(galaxy.scaleAmount, galaxy.scaleAmount);
      
      // Draw dust (spiral arms)
      this.ctx.save();
      const dustGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size);
      dustGradient.addColorStop(0, galaxy.dustColor.replace('0.1)', '0.3)'));
      dustGradient.addColorStop(0.3, galaxy.dustColor.replace('0.1)', '0.2)'));
      dustGradient.addColorStop(0.7, galaxy.dustColor);
      dustGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      this.ctx.fillStyle = dustGradient;
      
      // Draw spiral arms
      for (let i = 0; i < galaxy.arms; i++) {
        const angleOffset = (Math.PI * 2 / galaxy.arms) * i;
        this.ctx.save();
        this.ctx.rotate(angleOffset);
        
        this.ctx.beginPath();
        
        // Draw spiral arm using parametric equations
        for (let t = 0; t < 5; t += 0.1) {
          const radius = galaxy.size * 0.1 * (1 + galaxy.spiralFactor * t);
          const angle = t * 1.5;
          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle) * galaxy.ellipticity;
          
          if (t === 0) {
            this.ctx.moveTo(x, y);
          } else {
            this.ctx.lineTo(x, y);
          }
        }
        
        this.ctx.lineWidth = galaxy.size * 0.15;
        this.ctx.strokeStyle = galaxy.dustColor.replace('0.1)', '0.15)');
        this.ctx.stroke();
        
        this.ctx.restore();
      }
      
      // Draw galaxy core
      const coreGradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, galaxy.size * 0.3);
      coreGradient.addColorStop(0, galaxy.coreColor);
      coreGradient.addColorStop(0.6, galaxy.coreColor.replace('0.5)', '0.3)'));
      coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      this.ctx.fillStyle = coreGradient;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, galaxy.size * 0.25, galaxy.size * 0.25 * galaxy.ellipticity, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add some random stars in the galaxy
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * galaxy.size * 0.6;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance * galaxy.ellipticity;
        const size = Math.random() * 1.5 + 0.5;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      this.ctx.restore();
      
      // Reset transformations
      this.ctx.resetTransform();
    }
    
    this.ctx.restore();
  }
  
  // New method to draw nebulas
  drawNebulas() {
    this.ctx.save();
    
    for (const nebula of this.nebulas) {
      // Update rotation
      nebula.rotation += nebula.rotationSpeed;
      
      // Update position with smooth movement
      nebula.x += nebula.vx;
      nebula.y += nebula.vy;
      
      // Pulse effect based on time
      const time = Date.now() * 0.001;
      const pulseScale = 1 + Math.sin(time * nebula.pulseSpeed + nebula.timeOffset) * 0.05;
      
      // Wrap around edges
      if (nebula.x < -nebula.size) nebula.x = this.canvas.width + nebula.size;
      if (nebula.x > this.canvas.width + nebula.size) nebula.x = -nebula.size;
      if (nebula.y < -nebula.size) nebula.y = this.canvas.height + nebula.size;
      if (nebula.y > this.canvas.height + nebula.size) nebula.y = -nebula.size;
      
      // Draw nebula
      this.ctx.translate(nebula.x, nebula.y);
      this.ctx.rotate(nebula.rotation);
      this.ctx.scale(pulseScale, pulseScale);
      
      // Create gradient
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.size / 2);
      gradient.addColorStop(0, nebula.innerColor);
      gradient.addColorStop(1, nebula.outerColor);
      
      // Draw main nebula shape
      this.ctx.beginPath();
      
      // Start with first point
      const firstPoint = nebula.points[0];
      this.ctx.moveTo(firstPoint.x * nebula.size / 2, firstPoint.y * nebula.size / 2);
      
      // Draw curved lines between points
      for (let i = 0; i < nebula.points.length; i++) {
        const currentPoint = nebula.points[i];
        const nextPoint = nebula.points[(i + 1) % nebula.points.length];
        
        // Control points for curve
        const cpX1 = currentPoint.x * nebula.size / 2 + (nextPoint.x - currentPoint.x) * 0.3 * nebula.size / 2;
        const cpY1 = currentPoint.y * nebula.size / 2 + (nextPoint.y - currentPoint.y) * 0.3 * nebula.size / 2;
        const cpX2 = currentPoint.x * nebula.size / 2 + (nextPoint.x - currentPoint.x) * 0.7 * nebula.size / 2;
        const cpY2 = currentPoint.y * nebula.size / 2 + (nextPoint.y - currentPoint.y) * 0.7 * nebula.size / 2;
        
        this.ctx.bezierCurveTo(
          cpX1, cpY1,
          cpX2, cpY2,
          nextPoint.x * nebula.size / 2, nextPoint.y * nebula.size / 2
        );
      }
      
      this.ctx.closePath();
      
      // Fill with gradient
      this.ctx.fillStyle = gradient;
      this.ctx.globalCompositeOperation = 'screen';
      this.ctx.fill();
      
      // Add some stars inside the nebula
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      this.ctx.globalCompositeOperation = 'source-over';
      
      for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * nebula.size * 0.3;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const starSize = Math.random() * 1.5 + 0.5;
        
        this.ctx.beginPath();
        this.ctx.arc(x, y, starSize, 0, Math.PI * 2);
        this.ctx.fill();
      }
      
      // Reset transformations
      this.ctx.resetTransform();
    }
    
    this.ctx.restore();
  }
  
  drawAstronaut() {
    if (!this.astronaut.img.complete) return;
    
    this.ctx.save();
    
    // Update astronaut position
    this.astronaut.angle += 0.01;
    this.astronaut.x = this.astronaut.centerX + Math.cos(this.astronaut.angle) * this.astronaut.orbit;
    this.astronaut.y = this.astronaut.centerY + Math.sin(this.astronaut.angle) * this.astronaut.orbit * 0.5;
    
    // Add slight floating motion
    const floatOffset = Math.sin(this.astronaut.angle * 2) * 5;
    
    // Draw astronaut
    this.ctx.translate(this.astronaut.x, this.astronaut.y + floatOffset);
    this.ctx.rotate(Math.sin(this.astronaut.angle) * 0.2);
    this.ctx.drawImage(
      this.astronaut.img, 
      -this.astronaut.size / 2, 
      -this.astronaut.size / 2, 
      this.astronaut.size, 
      this.astronaut.size
    );
    
    this.ctx.restore();
  }
  
  animate() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Apply rotation from right-bottom corner
    if (this.isIndexPage) {
      this.rotation += this.rotationSpeed;
      
      this.ctx.save();
      // Set the rotation point to the right-bottom corner
      this.ctx.translate(this.canvas.width, this.canvas.height);
      this.ctx.rotate(this.rotation);
      this.ctx.translate(-this.canvas.width, -this.canvas.height);
      
      // Draw rotating elements
      this.drawNebulas();    
      this.drawGalaxies();   
      this.drawStars();      
      
      this.ctx.restore();
      
      // Draw non-rotating elements
      this.drawComets();     
      this.drawShootingStars(); // Shooting stars always visible
      this.drawAstronaut();  
    } else {
      // Normal drawing for non-index pages
      this.drawNebulas();    
      this.drawGalaxies();   
      this.drawStars();      
      this.drawComets();
      this.drawShootingStars(); // Add shooting stars to all pages
      this.drawAstronaut();  
    }
    
    // Continue animation
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize space background when the page loads
window.addEventListener('load', () => {
  const spaceBackground = new SpaceBackground();
  window.spaceBackground = spaceBackground;
  
  // Handle resize events to adjust background based on screen size
  window.addEventListener('resize', () => {
    const wasMobile = spaceBackground.isMobile;
    spaceBackground.isMobile = window.innerWidth <= 768;
    
    if (wasMobile !== spaceBackground.isMobile) {
      spaceBackground.adjustForDeviceType();
    }
  });
});
