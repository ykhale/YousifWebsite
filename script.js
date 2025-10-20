// DOM Elements
const themeToggle = document.querySelector('.theme-toggle');
const scrollProgressBar = document.querySelector('.scroll-progress-bar');
const nav = document.querySelector('.nav');

// Theme Toggle
function setupThemeToggle() {
  // Check if user has a theme preference stored
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }

  // Toggle theme on click
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    
    // Save preference
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  });
}

// Scroll Progress Bar
function updateScrollProgress() {
  const scrollTotal = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const scrollAmount = window.scrollY;
  const scrollPercentage = (scrollAmount / scrollTotal) * 100;
  
  scrollProgressBar.style.width = scrollPercentage + '%';
  
  // Add shadow to nav when scrolled
  if (scrollAmount > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}

// Animate elements when they come into view
function setupScrollAnimations() {
  const elementsToAnimate = document.querySelectorAll('.skills-category, .project__wrapper, .contact-method');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  
  elementsToAnimate.forEach(element => {
    // Set initial styles
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.5s, transform 0.5s';
    
    observer.observe(element);
  });
}

// Event Listeners
window.addEventListener('scroll', updateScrollProgress);
window.addEventListener('resize', updateScrollProgress);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  updateScrollProgress();
  setupScrollAnimations();
}); 