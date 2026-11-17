# Exporta la CA raíz de Avast Web/Mail Shield de ESTA máquina a los
# directorios que Docker copia al construir las imágenes.
#
# Avast genera un certificado distinto en cada PC. El de otra máquina no sirve.
# Si Avast no está instalado, o el escaneo HTTPS está apagado, el script no
# escribe nada y el build de Docker sigue igual.
#
# Uso, desde la raíz del repositorio:
#   powershell -ExecutionPolicy Bypass -File scripts/exportar-ca-avast.ps1
#   docker compose up --build

$ErrorActionPreference = "Stop"

$stores = @(
    "Cert:\LocalMachine\Root",
    "Cert:\CurrentUser\Root"
)

$found = foreach ($store in $stores) {
    Get-ChildItem $store -ErrorAction SilentlyContinue |
        Where-Object { $_.Subject -match "Avast Web/Mail Shield" }
}

$unique = @($found | Sort-Object Thumbprint -Unique)

if ($unique.Count -eq 0) {
    Write-Host "No hay una CA de Avast en este equipo. No hace falta extra-ca.crt."
    Write-Host "Seguí con: docker compose up --build"
    exit 0
}

$pems = foreach ($cert in $unique) {
    $b64 = [Convert]::ToBase64String(
        $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    )
    $lines = for ($i = 0; $i -lt $b64.Length; $i += 64) {
        $b64.Substring($i, [Math]::Min(64, $b64.Length - $i))
    }
    "-----BEGIN CERTIFICATE-----`n$($lines -join "`n")`n-----END CERTIFICATE-----"
}

$bundle = ($pems -join "`n") + "`n"
$enc = New-Object System.Text.UTF8Encoding $false
$root = Split-Path -Parent $PSScriptRoot
$destinos = @(
    (Join-Path $root "backend\certs\extra-ca.crt"),
    (Join-Path $root "frontend\certs\extra-ca.crt")
)

foreach ($destino in $destinos) {
    $dir = Split-Path -Parent $destino
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
    }
    [System.IO.File]::WriteAllText($destino, $bundle, $enc)
    Write-Host "Escrito $destino"
}

foreach ($cert in $unique) {
    Write-Host ("CA: " + $cert.Subject)
    Write-Host ("Huella: " + $cert.Thumbprint)
}

Write-Host "Listo. Reconstruí las imágenes: docker compose up --build"
