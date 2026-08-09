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
git fetch origin
git reset --hard origin/main
npm ci --omit=dev     # YALNIZ package-lock.json dəyişəndə
```

Sonra cPanel → **Setup Node.js App** → **Restart**.

**Niyə `git pull` yox, `reset --hard`?** İşləyən Next ISR revalidasiyası zamanı
`.next/server/app/**` altındakı prerender fayllarını (`*.html`, `*.rsc`,
`*.segment.rsc`) yenidən yazır. Onlar git-in izlədiyi fayllardır, ona görə
serverdə "local changes" kimi görünür və `git pull` "would be overwritten by
merge" xətası verib dayanır. Bu faylların serverdəki versiyası atılmalıdır —
yeni build onsuz da təzəsini gətirir. `reset --hard` yalnız izlənən faylları
sıfırlayır; `.env`, `.htaccess`, `node_modules/` və `.next/cache/` gitignore-da
olduğuna görə toxunulmur.

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
