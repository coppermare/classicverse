(() => {
  const NativeAudioContext = window.AudioContext || window.webkitAudioContext;
  if (!NativeAudioContext || window.__classicverseAudioCaptureInstalled) return;
  window.__classicverseAudioCaptureInstalled = true;

  const outputs = [];
  let active = false;
  let recorders = [];
  let chunks = [];
  let captureStartedAt = 0;

  const beginRecorder = (output) => {
    const recorder = new MediaRecorder(output.stream, {mimeType: 'audio/webm;codecs=opus'});
    const ownChunks = [];
    recorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) ownChunks.push(event.data);
    });
    recorder.start(100);
    recorders.push({recorder, ownChunks, offsetMs: performance.now() - captureStartedAt});
  };

  const attachCapture = (context) => {
    const output = context.createMediaStreamDestination();
    Object.defineProperty(context, '__classicverseCaptureOutput', {value: output});
    outputs.push(output);
    if (active) beginRecorder(output);
    return context;
  };

  function CapturingAudioContext(...args) {
    return attachCapture(new NativeAudioContext(...args));
  }
  CapturingAudioContext.prototype = NativeAudioContext.prototype;
  Object.setPrototypeOf(CapturingAudioContext, NativeAudioContext);
  window.AudioContext = CapturingAudioContext;
  if (window.webkitAudioContext) window.webkitAudioContext = CapturingAudioContext;

  const nativeConnect = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function(destination, ...args) {
    const result = nativeConnect.call(this, destination, ...args);
    if (destination instanceof AudioDestinationNode) {
      const output = this.context.__classicverseCaptureOutput;
      if (output) nativeConnect.call(this, output);
    }
    return result;
  };

  window.__classicverseStartAudioCapture = () => {
    active = true;
    captureStartedAt = performance.now();
    recorders = [];
    chunks = [];
    outputs.forEach(beginRecorder);
    return outputs.length;
  };

  window.__classicverseStopAudioCapture = async () => {
    active = false;
    const finished = recorders.map(({recorder, ownChunks, offsetMs}, index) => new Promise((resolve) => {
      recorder.addEventListener('stop', () => {
        const blob = new Blob(ownChunks, {type: 'audio/webm'});
        chunks[index] = blob;
        const link = document.createElement('a');
        link.id = `classicverse-audio-track-${index}`;
        link.href = URL.createObjectURL(blob);
        link.download = `classicverse-audio-track-${index}.webm`;
        link.textContent = `Download audio track ${index}`;
        link.style.position = 'fixed';
        link.style.left = '-9999px';
        document.body.appendChild(link);
        resolve({index, size: blob.size, offsetMs: Math.round(offsetMs)});
      }, {once: true});
      recorder.stop();
    }));
    return Promise.all(finished);
  };
})();
