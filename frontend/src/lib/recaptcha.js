const SITE_KEY = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

let loadPromise = null;

export function loadRecaptcha() {
  if (window.grecaptcha && window.grecaptcha.execute) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(script);
  });
  return loadPromise;
}

export async function executeRecaptcha(action = "register") {
  const attempt = new Promise((resolve, reject) => {
    loadRecaptcha()
      .then(() => {
        if (!window.grecaptcha || !window.grecaptcha.execute) return reject(new Error("reCAPTCHA not available"));
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(reject);
        });
      })
      .catch(reject);
  });
  const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("reCAPTCHA timeout")), 5000));
  return Promise.race([attempt, timeout]);
}
