$ErrorActionPreference = "Stop"

Write-Host "=========================================================="
Write-Host "  PortfolioAI - MonsterASP.net Automated Deployment Packager"
Write-Host "=========================================================="

$root = $PSScriptRoot
$frontendDir = Join-Path $root "frontend"
$backendDir = Join-Path $root "backend\PortfolioAI.Api"
$wwwrootDir = Join-Path $backendDir "wwwroot"
$publishDir = Join-Path $root "publish"
$zipPath = Join-Path $root "PortfolioAI-MonsterASP.zip"

# 1. Clean previous publish folder and zip
Write-Host "`n1. Cleaning previous publish artifacts..."
if (Test-Path $publishDir) {
    Remove-Item -Recurse -Force $publishDir
}
if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}
if (Test-Path $wwwrootDir) {
    Remove-Item -Recurse -Force $wwwrootDir
}
New-Item -ItemType Directory -Force -Path $wwwrootDir | Out-Null

# 2. Build Angular Frontend in Production Mode
Write-Host "`n2. Building Angular frontend for production..."
Push-Location $frontendDir
try {
    & npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "Angular build failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

# 3. Copy Angular dist files to ASP.NET Core wwwroot
Write-Host "`n3. Integrating Angular SPA into ASP.NET Core wwwroot..."
$distBrowserDir = Join-Path $frontendDir "dist\frontend\browser"
if (-not (Test-Path $distBrowserDir)) {
    $distBrowserDir = Join-Path $frontendDir "dist\frontend"
}

Copy-Item -Path "$distBrowserDir\*" -Destination $wwwrootDir -Recurse -Force
Write-Host "   Frontend files copied to $wwwrootDir"

# 4. Publish ASP.NET Core Web API
Write-Host "`n4. Publishing ASP.NET Core Web API (.NET 9)..."
& dotnet publish $backendDir -c Release -o $publishDir
if ($LASTEXITCODE -ne 0) {
    throw "dotnet publish failed with exit code $LASTEXITCODE"
}

# 5. Ensure Storage Directories exist in publish
Write-Host "`n5. Preparing JSON file storage directories in publish..."
$storageUsers = Join-Path $publishDir "storage\users"
$storagePublic = Join-Path $publishDir "storage\public"
New-Item -ItemType Directory -Force -Path $storageUsers | Out-Null
New-Item -ItemType Directory -Force -Path $storagePublic | Out-Null

# Keep existing user data if available
$existingStorage = Join-Path $backendDir "storage"
if (Test-Path $existingStorage) {
    Copy-Item -Path "$existingStorage\*" -Destination (Join-Path $publishDir "storage") -Recurse -Force -ErrorAction SilentlyContinue
}

# 6. Create deployment ZIP
Write-Host "`n6. Creating deployment package: PortfolioAI-MonsterASP.zip..."
Compress-Archive -Path "$publishDir\*" -DestinationPath $zipPath -Force

$zipFileInfo = Get-Item $zipPath
$zipSizeMb = [math]::Round($zipFileInfo.Length / 1MB, 2)

Write-Host "`n=========================================================="
Write-Host "  SUCCESS! Deployment package created successfully!"
Write-Host "  File: $zipPath ($zipSizeMb MB)"
Write-Host "=========================================================="
