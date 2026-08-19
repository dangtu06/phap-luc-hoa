// ===== HEADER SCROLL EFFECT =====
const header = document.getElementById('header');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }
});

// ===== MOBILE MENU TOGGLE =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.getElementById('navLinks');

mobileMenuBtn.addEventListener('click', () => {
  navLinks.classList.toggle('active');
  const spans = mobileMenuBtn.querySelectorAll('span');
  if (navLinks.classList.contains('active')) {
    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
  } else {
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  }
});

// Close mobile menu when a nav link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('active');
    const spans = mobileMenuBtn.querySelectorAll('span');
    spans[0].style.transform = 'none';
    spans[1].style.opacity = '1';
    spans[2].style.transform = 'none';
  });
});

// ===== SMOOTH SCROLL FOR ANCHOR LINKS =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    e.preventDefault();
    const target = document.querySelector(targetId);
    if (target) {
      const headerHeight = header.offsetHeight;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// ===== FAQ ACCORDION =====
function toggleFaq(button) {
  const faqItem = button.closest('.faq-item');
  const allItems = document.querySelectorAll('.faq-item');

  allItems.forEach(item => {
    if (item !== faqItem) {
      item.classList.remove('active');
    }
  });

  faqItem.classList.toggle('active');
}

// ===== SCROLL REVEAL ANIMATION =====
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.12,
  rootMargin: '0px 0px -60px 0px'
});

revealElements.forEach(el => revealObserver.observe(el));

// ===== ANIMATED COUNTER FOR STATS =====
function animateCounters() {
  const statNumbers = document.querySelectorAll('.stat-number');
  statNumbers.forEach(stat => {
    const text = stat.textContent.trim();
    const num = parseInt(text);
    if (isNaN(num)) return; // skip non-numeric like ∞

    let current = 0;
    const duration = 1500;
    const increment = num / (duration / 16);
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= num) {
        stat.textContent = num;
        clearInterval(timer);
      } else {
        stat.textContent = Math.floor(current);
      }
    }, 16);
  });
}

// Trigger counter animation when hero is visible
const heroSection = document.getElementById('hero');
const heroObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      heroObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

if (heroSection) {
  heroObserver.observe(heroSection);
}

// ===== FORM → GOOGLE SHEETS (Hidden Form + Iframe) =====
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxz5ZSuUNLOjnNNVAXdpuO1feuOWyQ5DIuwIoGDZT41XmmFqY5SZG6llxwmBpIlqg/exec";

// Tạo hidden iframe để nhận response (tránh chuyển trang khi submit)
const hiddenIframe = document.createElement('iframe');
hiddenIframe.name = 'plh_hidden_iframe';
hiddenIframe.id = 'plh_hidden_iframe';
hiddenIframe.style.display = 'none';
document.body.appendChild(hiddenIframe);

const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
  registrationForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(registrationForm);
    const data = Object.fromEntries(formData.entries());

    // Validate
    if (!data.ho || !data.ten || !data.email || !data.phone) {
      showNotification('Vui lòng điền đầy đủ thông tin bắt buộc.', 'warning');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      showNotification('Vui lòng nhập email hợp lệ.', 'warning');
      return;
    }

    // Loading state
    const submitBtn = registrationForm.querySelector('.form-submit');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '⏳ Đang gửi đăng ký...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';

    // Tạo hidden form gửi vào iframe (bypass CORS hoàn toàn)
    const hiddenForm = document.createElement('form');
    hiddenForm.method = 'POST';
    hiddenForm.action = GOOGLE_SCRIPT_URL;
    hiddenForm.target = 'plh_hidden_iframe'; // Gửi vào iframe, không chuyển trang
    hiddenForm.style.display = 'none';

    // Thêm các field vào hidden form
    const fields = {
      ho: data.ho,
      ten: data.ten,
      email: data.email,
      phone: data.phone,
      linhvuc: data.linhvuc || '',
      message: data.message || ''
    };

    for (const [key, value] of Object.entries(fields)) {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      hiddenForm.appendChild(input);
    }

    document.body.appendChild(hiddenForm);
    hiddenForm.submit();

    // Dọn dẹp + chuyển trang sau 2 giây
    setTimeout(function() {
      document.body.removeChild(hiddenForm);
      window.location.href = 'thank-you.html';
    }, 2000);
  });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message, type = 'success') {
  // Remove existing notifications
  const existing = document.querySelector('.notification-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `notification-toast notification-${type}`;
  toast.innerHTML = `
    <div class="notification-content">
      <span class="notification-icon">${type === 'success' ? '✅' : '⚠️'}</span>
      <span class="notification-message">${message}</span>
      <button class="notification-close" onclick="this.closest('.notification-toast').remove()">✕</button>
    </div>
  `;

  // Inject styles once
  if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      .notification-toast {
        position: fixed;
        top: 100px;
        right: 24px;
        z-index: 10000;
        max-width: 480px;
        animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
      }
      .notification-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        padding: 18px 22px;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        font-size: 0.92rem;
        line-height: 1.6;
      }
      .notification-success .notification-content {
        background: linear-gradient(135deg, #f0fdf4, #dcfce7);
        border: 1px solid #86efac;
        color: #166534;
      }
      .notification-warning .notification-content {
        background: linear-gradient(135deg, #fffbeb, #fef3c7);
        border: 1px solid #fcd34d;
        color: #92400e;
      }
      .notification-icon {
        font-size: 1.3rem;
        flex-shrink: 0;
        margin-top: 1px;
      }
      .notification-message {
        flex: 1;
      }
      .notification-close {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1rem;
        color: inherit;
        opacity: 0.5;
        padding: 0;
        flex-shrink: 0;
        transition: opacity 0.2s;
      }
      .notification-close:hover {
        opacity: 1;
      }
      @keyframes slideInRight {
        from { opacity: 0; transform: translateX(60px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  // Auto-dismiss after 6 seconds
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.transition = 'all 0.4s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(60px)';
      setTimeout(() => toast.remove(), 400);
    }
  }, 6000);
}

// ===== PARALLAX SUBTLE EFFECT FOR HERO =====
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg && scrolled < window.innerHeight) {
    heroBg.style.transform = `translateY(${scrolled * 0.3}px) scale(1.05)`;
  }
});

// ===== ACTIVE NAV LINK HIGHLIGHT =====
const sections = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  const scrollPos = window.scrollY + 120;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');

    if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
      navLinks.querySelectorAll('a').forEach(link => {
        link.classList.remove('active-link');
        if (link.getAttribute('href') === `#${sectionId}`) {
          link.classList.add('active-link');
        }
      });
    }
  });
});

// Inject active-link style
const activeLinkStyle = document.createElement('style');
activeLinkStyle.textContent = `
  .nav-links a.active-link {
    color: #D4A017 !important;
  }
  .nav-links a.active-link::after {
    width: 100% !important;
  }
`;
document.head.appendChild(activeLinkStyle);
