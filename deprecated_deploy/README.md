# Deploying to the VM

> **Note:** These steps have not been fully tested end-to-end, since the VM
> (`cse-aisearchinterface-dev-web-01.oit.umn.edu`) was inactive/unreachable
> at the time this was written. The build, backend, and nginx proxy were
> verified locally (via `vite preview` + a matching proxy config standing in
> for nginx), but not yet confirmed on the actual VM.

## One-time setup

```bash
# Fill in the TODOs in these two files first:
#   - deploy/nginx/aisearch.conf        (root path)
#   - deploy/systemd/aisearch-backend.service  (WorkingDirectory, User)

sudo ln -s /path/to/vueAISearch/deploy/nginx/aisearch.conf /etc/nginx/sites-enabled/aisearch.conf
sudo ln -s /path/to/vueAISearch/deploy/systemd/aisearch-backend.service /etc/systemd/system/aisearch-backend.service

sudo systemctl daemon-reload
sudo systemctl enable --now aisearch-backend
sudo systemctl status aisearch-backend   # should log "Backend running on http://localhost:3001" and "SERPAPI_KEY loaded: true"

sudo nginx -t && sudo systemctl reload nginx
```

Confirm the campus firewall allows inbound traffic on port 80 (443 later,
if TLS is added), and that DNS for
`cse-aisearchinterface-dev-web-01.oit.umn.edu` resolves to the VM.

## Initial build

```bash
cd /path/to/AISearch
git pull origin pilot

cd vueAISearch
npm ci
npm run build   # outputs dist/
```

## Future updates

```bash
git pull origin pilot && npm run build && sudo systemctl restart aisearch-backend
```

`systemctl restart` is only needed if `.env` or `server.js` changed —
otherwise `git pull && npm run build` alone is enough, since nginx serves
the new `dist/` immediately.
