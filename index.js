const express = require('express');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const tmp = require('tmp');

const app = express();
app.use(express.json({ limit: '32kb' }));

function synthesizeWithPhonikud(text, outPath, cb) {
  // Best-effort: call the `phonikud` CLI with common flags.
  // If phonikud uses different CLI flags adjust this function.
  const args = ['-t', text, '-o', outPath];
  const proc = spawn('phonikud', args, { stdio: 'inherit' });

  proc.on('error', (err) => cb(err));
  proc.on('exit', (code) => {
    if (code === 0 && fs.existsSync(outPath)) cb(null, outPath);
    else cb(new Error('phonikud exit code ' + code));
  });
}

app.post('/synthesize', (req, res) => {
  const text = (req.body && req.body.text) || req.query.text;
  if (!text) return res.status(400).send('text required');

  const tmpFile = tmp.tmpNameSync({ postfix: '.wav' });

  synthesizeWithPhonikud(text, tmpFile, (err, file) => {
    if (err) {
      console.error('synthesis error', err);
      return res.status(500).send('synthesis failed: ' + String(err.message || err));
    }
    res.setHeader('Content-Type', 'audio/wav');
    const stream = fs.createReadStream(file);
    stream.pipe(res);
    stream.on('close', () => {
      try { fs.unlinkSync(file); } catch (e) {}
    });
  });
});

app.get('/health', (req, res) => res.send('ok'));

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Phonikud TTS listening on ${port}`);
});
