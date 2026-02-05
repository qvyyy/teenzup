(() => {
  const animatedElements = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  const observeAnimations = (root = document) => {
    root.querySelectorAll('.animate-on-scroll').forEach((element) => {
      if (!animatedElements.has(element)) {
        animatedElements.add(element);
        observer.observe(element);
      }
    });
  };

  window.observeAnimations = observeAnimations;

  document.addEventListener('DOMContentLoaded', () => {
    observeAnimations();
  });
})();
