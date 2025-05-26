/*!
 * pwa-install-prompt
 * Copyright (c) 2024 ryxxn
 * Released under the MIT License
 * https://github.com/ryxxn/pwa-install-prompt
 */

// constants

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

const MODAL_STYLE = `
  .wepp-modal-overlay * { box-sizing: border-box; }
  .wepp-modal-overlay { display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, .5); justify-content: center; align-items: center; z-index: 99999; }
  .wepp-modal-content { min-width: 340px; max-width:340px; background: #fff; border-radius: 10px; position: relative; }
  .wepp-modal-content h1 { font-size: 18px; }
  .wepp-modal-body { display: flex; flex-direction: column; align-items: center; gap: 10px; }
  #wepp-logo { border-radius: 8px; }
  #wepp-install-button { width: 100%; background: #007bff; color: #fff; border: none; border-radius: 5px; font-size: 18px; cursor: pointer; font-weight: 700; transition: .3s; }
  #wepp-install-button:hover { background: #0056b3; }
  #wepp-install-button:active { transform: scale(.98); }
  #wepp-install-button:disabled { opacity:0.7; cursor: not-allowed; }
  #wepp-skip-button { all: initial; font:inherit; width: 100%; text-align: center; cursor: pointer; color: #a0a0a0; font-size: 14px; text-decoration: underline; }
`;

const IOS_MODAL_CONTENT = `
  <div class="wepp-modal-content" style="padding: 20px;">
    <div class="wepp-modal-body">
      <h1 style="margin-top: 0; margin-bottom: 10px;">${TEXT.IOS.TITLE}</h1>
      <img id="wepp-logo" alt="logo" width="64" height="64" />
      <h2 id="wepp-name"></h2>
    </div>
    <ol style="margin-block:4px;padding:0;margin-left:20px;">
      <li>
        ${TEXT.IOS.INSTALL_STEPS.STEP_1_1}
        <span style="vertical-align:middle;">
          <svg version="1.1" viewBox="0 0 2048 2048" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
            <path transform="translate(600,655)" d="m0 0h301l1 2v79..."/>
            <path transform="translate(1023,229)" d="m0 0 5 3 269 269..."/>
          </svg>
        </span>
        ${TEXT.IOS.INSTALL_STEPS.STEP_1_2}
      </li>
      <li>
        <p style="margin-block:4px;">${TEXT.IOS.INSTALL_STEPS.STEP_2}</p>
      </li>
    </ol>
    <button id="wepp-skip-button">${TEXT.SKIP_BUTTON}</button>
  </div>
`;

const DEFAULT_MODAL_CONTENT = `
  <div class="wepp-modal-content" style="padding: 20px;">
    <div class="wepp-modal-body">
      <h1 style="margin-top: 0; margin-bottom: 10px;">${TEXT.TITLE}</h1>
      <img id="wepp-logo" alt="logo" width="64" height="64" />
      <h2 id="wepp-name"></h2>
    </div>
    <button id="wepp-install-button" style="margin-top: 10px;padding: 10px;" disabled>${TEXT.WAITING}</button>
    <button id="wepp-skip-button" style="margin-top: 20px">${TEXT.SKIP_BUTTON}</button>
  </div>
`;

// functions

function getFaviconHref() {
  const linkElements = document.getElementsByTagName('link');
  for (let i = 0; i < linkElements.length; i++) {
    if (linkElements[i].getAttribute('rel') === 'icon') {
      return linkElements[i].getAttribute('href');
    }
  }
  return '';
}

function appendStyles() {
  const style = document.createElement('style');
  style.textContent = MODAL_STYLE;
  document.head.appendChild(style);
}

const getModalContent = (isIOS) => isIOS ? IOS_MODAL_CONTENT : DEFAULT_MODAL_CONTENT;

function createContainer() {
  const container = document.createElement('div');
  container.id = 'wepp-install-modal';
  container.className = 'wepp-modal-overlay';
  document.body.appendChild(container);
  return container;
}

const handleHashChange = () => {
  const hash = window.location.hash;
  const isValidHash = hash.startsWith('#wepp-install-modal');
  const modal = document.getElementById('wepp-install-modal');
  modal.style.display = isValidHash ? 'flex' : 'none';
};

const initializePWAInfo = () => {
  const nameElement = document.getElementById('wepp-name');
  const logoElement = document.getElementById('wepp-logo');
  const name = document.title;
  const logo = getFaviconHref();
  nameElement.textContent = name;
  logoElement.src = logo;
};

function handleModalClose() {
  window.location.hash = '';
  const modal = document.getElementById('wepp-install-modal');
  modal.style.display = 'none';
}

function preventModalContentClick(event) {
  event.stopPropagation();
}

function initializeModalEvents() {
  const modal = document.getElementById('wepp-install-modal');
  const skipButton = document.getElementById('wepp-skip-button');
  const modalContent = modal.querySelector('.wepp-modal-content');
  modal.addEventListener('click', handleModalClose);
  modalContent.addEventListener('click', preventModalContentClick);
  skipButton.addEventListener('click', handleModalClose);
}

const showPrompt = (deferredPrompt) => {
  try {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        handleModalClose();
      }
      deferredPrompt = null;
    });
  } catch (error) {
    console.log('Error: ', error);
  }
};

function main() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const isRunningAsPWA =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  appendStyles();
  const container = createContainer();
  container.innerHTML = getModalContent(isIOS);
  handleHashChange();
  initializePWAInfo();
  initializeModalEvents();
  window.addEventListener('hashchange', handleHashChange);

  if (isRunningAsPWA) {
    handleModalClose();
  } else {
    if (isMobile) {
      window.location.hash = '#wepp-install-modal';
    }

    if (!isIOS) {
      let beforeInstallPromptFired = false;
      const installButton = document.getElementById('wepp-install-button');

      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        const deferredPrompt = e;
        installButton.addEventListener('click', () => showPrompt(deferredPrompt), { once: true });
        installButton.innerText = TEXT.INSTALL_BUTTON;
        installButton.disabled = false;
        beforeInstallPromptFired = true;
      });

      setTimeout(() => {
        if (!beforeInstallPromptFired) {
          installButton.innerText = TEXT.INSTALL_UNAVAILABLE;
          installButton.disabled = true;
        }
      }, 1000);
    }
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
