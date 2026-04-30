$ErrorActionPreference = "Stop"

$frontend = $env:FRONTEND_URL
if (-not $frontend) { $frontend = "https://frontend-six-livid-36.vercel.app" }

$backend = $env:BACKEND_URL
if (-not $backend) { $backend = "https://backend-steel-three-33.vercel.app" }

$routes = @("/", "/login", "/register", "/dashboard", "/onboarding", "/resume/upload", "/jobs", "/jobs/today", "/applications", "/analytics", "/assistant", "/tools", "/admin")

Write-Host "Checking backend health: $backend/api/health"
Invoke-WebRequest -Uri "$backend/api/health" -UseBasicParsing | Out-Null

foreach ($route in $routes) {
  $url = "$frontend$route"
  Write-Host "Checking $url"
  Invoke-WebRequest -Uri $url -UseBasicParsing | Out-Null
}

Write-Host "Smoke checks completed."
