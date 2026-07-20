param(
  [string]$token = $env:VERCEL_API_TOKEN
)

if (-not $token) {
  Write-Error "VERCEL_API_TOKEN not set. Set it in .env or pass -token"
  exit 1
}

$env:VERCEL_API_TOKEN = $token

Write-Output "Deploying HOP to Vercel..."
npx vercel --prod --token $token 2>&1
