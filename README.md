# React + Node.js (Express) workspace

## Prereqs (PowerShell)
If `npm`/`npm.cmd` is not found, restart the VS Code terminal (or VS Code).

If `npm` fails due to execution policy, run this once per terminal session:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

If you still get “command not found”, this also works:

```powershell
$env:Path += ";C:\Program Files\nodejs"
```

## Install
From the repo root:

```powershell
npm.cmd install
```

## Dev (runs API + client)

```powershell
npm.cmd run dev
```

- Client: http://localhost:5173
- API health: http://localhost:3001/api/health

## Run individually

```powershell
npm.cmd run dev -w packages/server
npm.cmd run dev -w packages/client
```

## Default accounts

The auth screens accept either an email or a username. The default demo usernames map to local Supabase emails behind the scenes:

- Admin: `jireh` / `faith`
- Staff: `jai` / `212121`

To create or refresh those accounts in Supabase, run:

```powershell
npm.cmd run bootstrap:default-users -w packages/server
```

## Production-ish

```powershell
npm.cmd run build
npm.cmd run start
```
