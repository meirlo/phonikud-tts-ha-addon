# phonikud-tts-ha-addon
An Home Assistant add-on that exposes Phonikud as a TTS HTTP service.

## Usage
- Install and run this add-on in your Home Assistant (see addon config).
- The add-on exposes an HTTP API:
  - POST /synthesize
    - JSON body: { "text": "Hello world", "voice": "optional", "format": "wav" }
    - Returns: audio/wav binary on success
  - GET /health
    - Returns 200 when server is up

## Home Assistant example (use REST TTS platform):
- add to configuration.yaml:
  ```yaml
  tts:
    - platform: rest
      name: phonikud
      resource: http://ADDON_HOST:5000/synthesize
      method: POST
      headers:
        Content-Type: application/json
      payload: '{"text":"{{ text }}"}'
      format: 'wav'
  ```

## Notes
- The add-on attempts to clone and install the phonikud repository at build time.
- The wrapper calls a `phonikud` CLI expected to be available in the container.
- If you need custom flags for phonikud, edit index.js accordingly.
