export const Rec = {
  stream: null, mr: null, chunks: [],
  async start() {
    if (!this.stream) this.stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    const type = ['audio/mp4', 'audio/webm;codecs=opus', 'audio/webm'].find(t => MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(t));
    this.chunks = [];
    this.mr = new MediaRecorder(this.stream, type ? { mimeType: type } : undefined);
    this.mr.ondataavailable = e => { if (e.data && e.data.size) this.chunks.push(e.data); };
    this.mr.start();
  },
  stop() {
    return new Promise(res => {
      const mr = this.mr;
      if (!mr || mr.state === 'inactive') return res(null);
      mr.onstop = () => res(new Blob(this.chunks, { type: mr.mimeType || 'audio/mp4' }));
      mr.stop();
    });
  },
  release() {
    if (this.mr && this.mr.state !== 'inactive') try { this.mr.stop(); } catch (e) {}
    if (this.stream) this.stream.getTracks().forEach(t => t.stop());
    this.stream = null; this.mr = null;
  },
};
