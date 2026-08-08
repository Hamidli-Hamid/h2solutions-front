# h2solutions front — build output

**Bu qovluğu əl ilə redaktə etmə.** Məzmunu `frontend/scripts/build-deploy.sh`
tərəfindən avtomatik yaradılır və hər build-də üzərinə yazılır.

## Deploy (lokal)

```bash
cd frontend
./scripts/build-deploy.sh
```

Build vurur → çıxışı `front-build/`-ə sinxronlaşdırır → commit + push edir.

## Deploy (cPanel)

```bash
cd ~/h2front
git pull
npm ci --omit=dev     # YALNIZ package-lock.json dəyişəndə
```

Sonra cPanel → **Setup Node.js App** → **Restart**.

## cPanel-də birdəfəlik quraşdırma

1. **Git Version Control** → Create → deploy repo-nun URL-i, path `~/h2front`.
2. **Setup Node.js App**:
   - Node.js version: **22**
   - Application root: `h2front`
   - Application startup file: `server.js`
   - Environment variables:
     - `NODE_ENV=production`
     - `REVALIDATE_SECRET=…` (backend `.env`-dəki `H2_REVALIDATE_SECRET` ilə eyni)
3. Terminal: `cd ~/h2front && npm ci --omit=dev`
4. Restart.

## Qeydlər

- `NEXT_PUBLIC_*` dəyişənləri **build zamanı** bişir — cPanel env panelinə yazmaq
  onlara təsir etmir. Dəyişmək üçün `frontend/.env.production`-u redaktə edib
  yenidən build vurmaq lazımdır.
- `node_modules` git-ə getmir: burada platformaya bağlı binar-lar var
  (lokal maşın arm64, cPanel x64).
- `.next/cache/` ignore olunub — serverdə ISR keşi ora yazılır.
- Bu repo-ya **force-push etmə**: cPanel `git pull`-u fast-forward gözləyir.
