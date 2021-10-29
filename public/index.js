const qrGenText = document.querySelector('#qr-gen-text');
const qrGenBtns = document.querySelectorAll('.qr-gen-buttons');
const qrGenBtn = document.querySelector('#qr-gen-button');
const qrGenLinkPNG = document.querySelector('#qr-gen-link-png');
const qrGenLinkSVG = document.querySelector('#qr-gen-link-svg');
const qrGenImg = document.querySelector('#qr-gen-image');
const qrGenImgLink = document.querySelector('#qr-gen-image-link');
const qrReadText = document.querySelector('#qr-read-text');
const qrReadImg = document.querySelector('#qr-read-image');
const qrReadFile = document.querySelector('#qr-read-file');

qrGenText.addEventListener('input', textInput);
qrGenBtn.addEventListener('click', qrGen);
qrGenBtn.format = 'png';
qrGenLinkPNG.addEventListener('click', qrGen);
qrGenLinkPNG.format = 'png';
qrGenLinkSVG.addEventListener('click', qrGen);
qrGenLinkSVG.format = 'svg';
qrReadFile.addEventListener('change', loadImage);

const url = 'https://qr-re-gen.david-eredics.workers.dev';

// toggle "Generate" button if text is provided
function textInput() {
  qrGenBtns.forEach(btn => {
    if (qrGenText.value.length > 0) {
      btn.toggleAttribute('disabled', false);
    } else {
      btn.toggleAttribute('disabled', true);
    }
    if (qrGenText.value.length > 2331) {
      qrGenBtn.textContent = 'Too long';
      qrGenBtn.classList.toggle('alert-warning', true);
      btn.toggleAttribute('disabled', true);
    } else {
      btn.toggleAttribute('disabled', false);
      qrGenBtn.textContent = 'Generate';
      qrGenBtn.classList.toggle('alert-warning', false);
    }
  });
}

// Send POST request to generate QR code
function qrGen(event) {
  qrGenBtn.textContent = 'Generating...';
  qrGenBtn.classList.toggle('alert-danger', false);

  const text = qrGenText.value;
  const format = event.currentTarget.format;
  const data = { 'text': text, 'format': format };

  fetch(url, {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
    .then(response => {
      response.blob()
        .then(blob => {
          const objectURL = URL.createObjectURL(blob);
          qrGenImg.src = objectURL;
          qrGenBtn.textContent = 'Generate';
          qrGenImgLink.toggleAttribute('hidden', false);
          qrGenImgLink.href = objectURL;
          qrGenImgLink.download = qrGenText.value + '.' + format;
        });
    })
    .catch(error => {
      console.error('fetch error:', error);
      qrGenBtn.textContent = 'Error';
      qrGenBtn.classList.toggle('alert-danger', true);
    });
}

// Send PUT request to read QR code
function qrRead(image) {
  fetch(url, {
    method: 'PUT',
    mode: 'cors',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'image/png'
    },
    body: image
  })
    .then(response => {
      response.json()
        .then(json => {
          if (Object.prototype.hasOwnProperty.call(json, 'text')) {
            qrReadText.value = json.text;
            qrReadText.classList.replace('alert-info', 'alert-success');
          } else if (Object.prototype.hasOwnProperty.call(json, 'Error')) {
            qrReadText.value = 'Error: ' + json.Error;
            qrReadText.classList.replace('alert-info', 'alert-danger');
          } else {
            qrReadText.value = 'Error';
            qrReadText.classList.replace('alert-info', 'alert-danger');
          }
        });
    })
    .catch(error => {
      console.error('fetch error:', error);
      qrReadText.value = 'Error';
      qrReadText.classList.replace('alert-info', 'alert-danger');
    });
}

function loadImage(event) {
  const file = event.target.files[0];
  qrReadText.toggleAttribute('hidden', false);
  qrReadText.classList.toggle('alert-danger', false);
  qrReadText.classList.toggle('alert-success', false);
  qrReadText.value = 'Processing...';
  qrReadText.classList.add('alert-info');
  if (file.type === 'image/png') {
    qrReadImg.src = URL.createObjectURL(file);
    qrReadImg.toggleAttribute('hidden', false);
    qrRead(event.target.files[0]);
  } else {
    qrReadImg.toggleAttribute('hidden', true);
    qrReadText.value = 'Error: only png supported';
    qrReadText.classList.replace('alert-info', 'alert-danger');
  }
}
