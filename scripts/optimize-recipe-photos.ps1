$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$manifest = Get-Content (Join-Path $projectRoot 'docs/generated-recipe-photos.json') -Raw | ConvertFrom-Json
$destination = Join-Path $projectRoot 'public/photos/recipes'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object MimeType -eq 'image/jpeg'
$parameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$parameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new([System.Drawing.Imaging.Encoder]::Quality, [long]85)
foreach ($entry in $manifest) {
  $source = [System.Drawing.Image]::FromFile($entry.source)
  $bitmap = [System.Drawing.Bitmap]::new(1200, 900)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.DrawImage($source, 0, 0, 1200, 900)
    $bitmap.Save((Join-Path $destination ($entry.slug + '.jpg')), $codec, $parameters)
  } finally {
    $graphics.Dispose()
    $bitmap.Dispose()
    $source.Dispose()
  }
}
$parameters.Dispose()
Write-Output "Optimized $($manifest.Count) recipe photos."
