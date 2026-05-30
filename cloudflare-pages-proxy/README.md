# Cloudflare Pages Proxy

Proxy ini menyediakan alamat publik sementara ketika jalur ISP menuju subdomain
`workers.dev` tidak stabil.

Alamat publik:

```text
https://syp-33-6-alumni.pages.dev
```

Deploy ulang setelah mengubah `_worker.js`:

```bash
npm run deploy:pages-proxy
```

Proxy meneruskan request ke Worker utama. Setelah domain produksi milik sendiri
tersedia, gunakan Cloudflare Workers Custom Domain sebagai alamat utama.
