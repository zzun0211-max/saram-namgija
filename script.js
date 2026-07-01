const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-nav');

window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 90);
});

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? '메뉴 열기' : '메뉴 닫기');
  mobileMenu.hidden = open;
});

mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

let counted = false;
const stats = document.querySelector('.stats-bar');
const countObserver = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting || counted) return;
  counted = true;
  document.querySelectorAll('.counter').forEach((counter) => {
    const target = Number(counter.dataset.target);
    const start = performance.now();
    const duration = 1000;
    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      counter.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3)));
      if (progress < 1) requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  });
}, { threshold: 0.4 });
countObserver.observe(stats);

document.querySelectorAll('.faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item').forEach((faq) => {
      faq.classList.remove('open');
      faq.querySelector('button').setAttribute('aria-expanded', 'false');
    });
    if (!isOpen) {
      item.classList.add('open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

const phoneInput = document.querySelector('input[name="phone"]');
phoneInput.addEventListener('input', (event) => {
  const digits = event.target.value.replace(/\D/g, '').slice(0, 11);
  if (digits.length < 4) event.target.value = digits;
  else if (digits.length < 8) event.target.value = `${digits.slice(0, 3)}-${digits.slice(3)}`;
  else event.target.value = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
});

const quoteForm = document.querySelector('#quote-form');
const quoteEndpoint = document.querySelector('meta[name="quote-endpoint"]')?.content.trim();

quoteForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = quoteForm.querySelector('.form-submit');
  const status = quoteForm.querySelector('.form-status');

  status.classList.remove('error');

  if (!quoteEndpoint) {
    status.textContent = '접수 주소가 아직 설정되지 않았습니다. 관리자에게 문의해 주세요.';
    status.classList.add('error');
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = '신청 내용을 확인하고 있어요...';

  const payload = new URLSearchParams(new FormData(quoteForm));
  payload.set('submittedAt', new Date().toISOString());
  payload.set('source', '사람을남기자 홈페이지');
  payload.set('pageUrl', window.location.href);

  try {
    await fetch(quoteEndpoint, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
      body: payload.toString(),
    });

    status.textContent = '견적 신청이 접수되었습니다. 빠르게 연락드리겠습니다.';
    quoteForm.reset();
  } catch (error) {
    status.textContent = '접수 중 문제가 발생했습니다. 잠시 후 다시 시도하거나 전화로 문의해 주세요.';
    status.classList.add('error');
  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = '무료 견적 신청하기 <span>→</span>';
  }
});

const modal = document.querySelector('#privacy-modal');
document.querySelectorAll('[data-modal-open]').forEach((button) => {
  button.addEventListener('click', () => modal.showModal());
});
document.querySelectorAll('[data-modal-close]').forEach((button) => {
  button.addEventListener('click', () => modal.close());
});
modal.addEventListener('click', (event) => {
  if (event.target === modal) modal.close();
});
