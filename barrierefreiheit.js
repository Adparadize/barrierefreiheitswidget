(function () {
  if (window.AdparadizeWidgetLoaded) return;
  window.AdparadizeWidgetLoaded = true;

  const style = document.createElement('style');
  style.textContent = `
    #accessibility-toggle {
      position: fixed;
      top: 40%;
      left: 10px;
      background: transparent;
      border: none;
      cursor: pointer;
      z-index: 10000;
    }

    #accessibility-toggle img {
      width: 48px;
      height: 48px;
    }

    #accessibility-toolbar {
      position: fixed;
      top: 40%;
      left: 70px;
      background: #ffffff;
      padding: 10px;
      border-radius: 10px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 8px;
      font-family: sans-serif;
    }

    #accessibility-toolbar button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: #f0f0f0;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 14px;
    }

    #accessibility-toolbar button img {
      width: 20px;
      height: 20px;
    }

    #accessibility-header {
      font-size: 16px;
      margin-bottom: 6px;
      text-align: center;
      color: #333;
      font-weight: bold;
    }

    body.high-contrast {
      background-color: #000 !important;
      color: #fff !important;
      filter: contrast(180%) grayscale(100%);
    }

    body.colorblind-mode, body.colorblind-mode * {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
    }

    *:focus {
      outline: 3px solid #ffcc00;
      outline-offset: 2px;
    }
  `;
  document.head.appendChild(style);

  const html = `
    <div id="accessibility-toggle" onclick="toggleToolbar()" title="Barrierefreiheit öffnen">
      <img src="https://www.adparadize.com/s/Barrierefrei.png" alt="Barrierefreiheit" />
    </div>

    <div id="accessibility-toolbar" style="display: none;">
      <div id="accessibility-header"><strong>Adparadize</strong></div>
      <button onclick="applyInstantView()">
        <img src="https://www.adparadize.com/s/Sofortansicht.png" alt="Sofortansicht" /> Sofortansicht
      </button>
      <button onclick="toggleContrast()">
        <img src="https://www.adparadize.com/s/Contrast.png" alt="Kontrast" /> Kontrast
      </button>
      <button onclick="changeTextSize(1)">
        <img src="https://www.adparadize.com/s/Groer.png" alt="Textgröße erhöhen" /> Text +
      </button>
      <button onclick="changeTextSize(-1)">
        <img src="https://www.adparadize.com/s/Kleiner.png" alt="Textgröße verringern" /> Text −
      </button>
      <button onclick="toggleColorBlindMode()">
        <img src="https://www.adparadize.com/s/Farbschwache.png" alt="Farbschwächemodus" /> Farbschwäche
      </button>
      <button onclick="startReading()">
        <img src="https://www.adparadize.com/s/Vorlesen.png" alt="Vorlesen" /> Vorlesen
      </button>
      <button onclick="resetAccessibility()">
        <img src="https://www.adparadize.com/s/Reset.png" alt="Zurücksetzen" /> Zurücksetzen
      </button>
    </div>
  `;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = html;
  document.body.appendChild(wrapper);

  // Funktionaler Code
  let textScale = 10;

  window.toggleToolbar = function () {
    const toolbar = document.getElementById('accessibility-toolbar');
    toolbar.style.display = (toolbar.style.display === 'none') ? 'flex' : 'none';
  };

  window.toggleContrast = function () {
    document.body.classList.toggle('high-contrast');
    saveState('contrast', document.body.classList.contains('high-contrast'));
  };

  window.changeTextSize = function (direction) {
    textScale = Math.max(0, Math.min(20, textScale + direction));
    const newSize = 80 + (textScale * 6);
    document.documentElement.style.fontSize = newSize + '%';
    saveState('textSizeStep', textScale);
  };

  window.toggleColorBlindMode = function () {
    document.body.classList.toggle('colorblind-mode');
    saveState('colorblind', document.body.classList.contains('colorblind-mode'));
  };

  window.startReading = function () {
    speechSynthesis.cancel();
    const selectedText = window.getSelection().toString();
    const textToRead = selectedText || document.body.innerText.slice(0, 1000);
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = document.documentElement.lang || 'de-DE';
    speechSynthesis.speak(utterance);
  };

  window.resetAccessibility = function () {
    document.body.classList.remove('high-contrast', 'colorblind-mode');
    document.documentElement.style.fontSize = '';
    localStorage.removeItem('accessibilitySettings');
    speechSynthesis.cancel();
    textScale = 10;
  };

  window.applyInstantView = function () {
    if (!document.body.classList.contains('high-contrast')) toggleContrast();
    if (!document.body.classList.contains('colorblind-mode')) toggleColorBlindMode();
    textScale = Math.max(textScale, 13);
    const newSize = 80 + (textScale * 6);
    document.documentElement.style.fontSize = newSize + '%';
    saveState('textSizeStep', textScale);
  };

  function saveState(key, value) {
    let settings = JSON.parse(localStorage.getItem('accessibilitySettings')) || {};
    settings[key] = value;
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
  }

  function loadSettings() {
    let settings = JSON.parse(localStorage.getItem('accessibilitySettings')) || {};
    if (settings.contrast) document.body.classList.add('high-contrast');
    if (settings.colorblind) document.body.classList.add('colorblind-mode');
    if (typeof settings.textSizeStep === 'number') {
      textScale = settings.textSizeStep;
      const newSize = 80 + (textScale * 6);
      document.documentElement.style.fontSize = newSize + '%';
    }
  }

  document.addEventListener('DOMContentLoaded', loadSettings);
})();
