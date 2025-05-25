/*!
 * pwa-install-prompt
 * Copyright (c) 2024 ryxxn
 * Released under the MIT License
 * https://github.com/ryxxn/pwa-install-prompt
 */
let deferredPrompt;

const TEXT = {
  TITLE: 'Install as an app',
  WAITING: 'Loading app info...',
  SKIP_BUTTON: "I'm fine, I'll just view it on my mobile.",
  INSTALL_BUTTON: 'Install as an app',
  INSTALL_UNAVAILABLE: "The app is already installed or your environment doesn't support installation.",
  IOS: {
    TITLE: 'IOS App Installation Method',
    INSTALL_STEPS: {
      STEP_1_1: 'Click the icon',
      STEP_1_2: 'in the browser address bar.',
      STEP_2: "Click 'Add to Home Screen'.",
    }
  },
};

const IOS_MODAL_CONTENT = `
  <div class="wepp-modal-content" style="padding:20px;">
    <div class="wepp-modal-body">
      <h1 style="margin:0 0 10px;">${TEXT.IOS.TITLE}</h1>
      <img id="wepp-logo" alt="logo" width="64" height="64"/>
      <h2 id="wepp-name"></h2>
    </div>
    <ol style="margin-block:4px;padding:0;margin-left:20px;">
      <li>${TEXT.IOS.INSTALL_STEPS.STEP_1_1}
        <span style="vertical-align:middle;">[SVG REMOVED FOR BREVITY]</span>
        ${TEXT.IOS.INSTALL_STEPS.STEP_1_2}</li>
      <li><p style="margin-block:4px;">${TEXT.IOS.INSTALL_STEPS.STEP_2}</p></li>
    </ol>
    <button id="wepp-skip-button">${TEXT.SKIP_BUTTON}</button>
  </div>
`;

const DEFAULT_MODAL_CONTENT = `
  <div class="wepp-modal-content" style="padding:20px;">
    <div class="wepp-modal-body">
      <h1 style="margin:0 0 10px;">${TEXT.TITLE}</h1>
      <img id="wepp-logo" alt="logo" width="64" height="64"/>
      <h2 id="wepp-name"></h2>
    </div>
    <button id="wepp-install-button" style="margin-top:10px;padding:10px;" disabled>${TEXT.WAITING}</button>
    <button id="wepp-skip-button" style="margin-top:20px">${TEXT.SKIP_BUTTON}</button>
  </div>
`;

const getModalContent = isIOS => isIOS ? IOS_MODAL_CONTENT : DEFAULT_MODAL_CONTENT;

function createContainer() {
  const container = document.createElement('div');
  container.id = 'wepp-install-modal';
  container.className = 'wepp-modal-overlay';
  document.body.appendChild(container);
  return container;
}

const handleHashChange = () => {
  const modal = document.getElementById('wepp-install-modal');
  modal.style.display = window.location.hash.startsWith('#wepp-install-modal') ? 'flex' : 'none';
};

const initializePWAInfo = () => {
  document.getElementById('wepp-name').textContent = document.title;
  document.getElementById('wepp-logo').src = '';  // Removed favicon reference here
};

function handleModalClose() {
  window.location.hash = '';
  document.getElementById('wepp-install-modal').style.display = 'none';
}

function preventModalContentClick(e) {
  e.stopPropagation();
}

function initializeModalEvents() {
  const modal = document.getElementById('wepp-install-modal');
  const content = modal.querySelector('.wepp-modal-content');
  const skipButton = document.getElementById('wepp-skip-button');
  modal.addEventListener('click', handleModalClose);
  content.addEventListener('click', preventModalContentClick);
  skipButton.addEventListener('click', handleModalClose);
}

function main() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  const container = createContainer();
  container.innerHTML = getModalContent(isIOS);
  handleHashChange();
  initializePWAInfo();
  initializeModalEvents();
  window.addEventListener('hashchange', handleHashChange);

  if (isStandalone) {
    handleModalClose();
    return;
  }

  if (!isIOS) {
    const installBtn = document.getElementById('wepp-install-button');
    let timeoutId;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      installBtn.disabled = false;
      installBtn.innerText = TEXT.INSTALL_BUTTON;

      installBtn.addEventListener('click', () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then(choice => {
            if (choice.outcome === 'accepted') handleModalClose();
            deferredPrompt = null;
          });
        }
      }, { once: true });

      clearTimeout(timeoutId);
    });

    timeoutId = setTimeout(() => {
      if (!deferredPrompt) {
        installBtn.innerText = TEXT.INSTALL_UNAVAILABLE;
        installBtn.disabled = true;
      }
    }, 1000);
  }

  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}
