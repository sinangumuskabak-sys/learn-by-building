# NVIDIA proxy

NVIDIA's API (`integrate.api.nvidia.com`) sends no CORS headers, so a web page cannot call it. This Cloudflare Worker
passes Maymun's chat and model-list requests through with the learner's own key, so pasting a key in the settings is
enough on any device. It stores and logs nothing, and answers only the site's own origins. It runs on the project's
own free Cloudflare account (no card, so nothing can be billed: past the daily free limit it just stops until the
next day).

```bash
cd workers/nvidia-proxy
npx wrangler login    # the project's Cloudflare account
npx wrangler deploy   # prints https://nvidia-proxy.<account>.workers.dev
```

Put the printed address (with `/v1`) in `NVIDIA_PROXY` in `src/maymun/ai.ts`. Without the proxy, `public/nvidia-bridge.mjs`
does the same from the learner's own computer.
