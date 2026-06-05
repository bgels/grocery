const context = new AudioContext();

function playKeypad() {
  const source = context.createBufferSource();
  source.buffer = laserBuffer;
  source.connect(ctx.destination);
  source.start();
}
