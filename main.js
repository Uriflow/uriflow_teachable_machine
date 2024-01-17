const URL = "./my_model/";
let model, webcam, labelContainer, maxPredictions, canvas, ctx;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const video = document.getElementById('video');
  webcam = new tmImage.Webcam(200, 200, true);
  await webcam.setup();
  await webcam.play();

  document.body.appendChild(video);

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  labelContainer = document.getElementById("label-container");

  loop();
}

async function loop() {
  webcam.update();
  renderToCanvas();
  await predict();
  window.requestAnimationFrame(loop);
}

function renderToCanvas() {
  ctx.drawImage(webcam.canvas, 0, 0, canvas.width, canvas.height);
}

async function predict() {
  const prediction = await model.predict(webcam.canvas);

  const maxPrediction = prediction.reduce((max, current) => (max.probability > current.probability) ? max : current);

  labelContainer.innerHTML = '';

  const classPrediction = maxPrediction.className + ": " + maxPrediction.probability.toFixed(2);
  labelContainer.innerHTML = classPrediction;

  // 當偵測到有'感染'时，更改背景顏色
  const infectionDetected = maxPrediction.className.toLowerCase().includes('過多');
  document.body.style.backgroundColor = infectionDetected ? '#F37770' : '#C2D7C8';

  // 當偵測到模型中文字有'水滴寶寶'時，更改背景顏色為白色
  const waterDropDetected = maxPrediction.className.toLowerCase().includes('水滴寶寶');
  document.body.style.backgroundColor = waterDropDetected ? '#FFFFFF' : document.body.style.backgroundColor;
}

init();