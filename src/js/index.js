import html2canvas from 'html2canvas';
import { toPng } from 'html-to-image';

const debugImg = document.querySelector('.debug img');
const usHTMLtoImage = window.location.hash === '#html-to-image';

let ctx;
let scale = window.devicePixelRatio;
let x;

let timeout;

const menuWidth = 90;
const menuHeight = 60;

const menu = document.querySelector('.menu');

function getRectBrightness(ctx, x, y, w, h) {
  const imageData = ctx.getImageData(x, y, w, h);

  imageDataToImgTag(imageData);

  let brightness = 0;

  for (let k = 0; k < imageData.data.length; k += 4) {
    const r = imageData.data[k];
    const g = imageData.data[k + 1];
    const b = imageData.data[k + 2];
    const a = imageData.data[k + 3];

    brightness += 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const COLORS_COUNT = 4; // r g b a

  return brightness / (imageData.data.length / COLORS_COUNT);
}

function imageDataToImgTag(imageData) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = imageData.width;
  canvas.height = imageData.height;
  ctx.putImageData(imageData, 0, 0);

  debugImg.src = canvas.toDataURL();
}

function checkColor(ctx) {
  const y = window.scrollY * scale;

  const brightness = getRectBrightness(
    ctx,
    x,
    y,
    menuWidth * scale,
    menuHeight * scale
  );

  if (brightness > 127) {
    menu.style.color = 'black';
  } else {
    menu.style.color = 'white';
  }
}

let snapshot;

function main() {
  const start = new Date().getTime();

  if (usHTMLtoImage) {
    toPng(document.body).then(function (dataUrl) {
      console.log('-- html-to-image --');
      console.log(new Date().getTime() - start, 'ms');

      snapshot = new Image();
      const canvas = document.createElement('canvas');
      canvas.width = window.innerWidth * scale;
      canvas.height = document.body.clientHeight * scale;
      ctx = canvas.getContext('2d');
      x = (window.innerWidth - menuWidth) * scale;

      snapshot.onload = function () {
        ctx.drawImage(snapshot, 0, 0);
        checkColor(ctx);
      };

      snapshot.src = dataUrl;
    });
  } else {
    html2canvas(document.body).then(function (canvas) {
      console.log('-- html2canvas --');
      console.log(new Date().getTime() - start, 'ms');
      ctx = canvas.getContext('2d');
      x = (window.innerWidth - menuWidth) * scale;
      checkColor(ctx);
    });
  }
}

window.addEventListener('scroll', () => {
  if (!ctx) {
    return;
  }

  checkColor(ctx);
});

window.addEventListener('resize', () => {
  clearTimeout(timeout);
  timeout = setTimeout(() => main(), 250);
});

main();
