Add-Type -AssemblyName System.Drawing
$sourcePath = (Join-Path $PSScriptRoot '../docs/references/character-creator-button-sheet.png')
$assetDir = Join-Path $PSScriptRoot '../web/opening/assets/buttons'
New-Item -ItemType Directory -Force -Path $assetDir | Out-Null
$source = [Drawing.Bitmap]::new($sourcePath)
$scale = $source.Width / 2048.0
$manifest = [ordered]@{source='User-supplied Character Creator Button Asset Sheet, 2026-09-24';sourceSha256=(Get-FileHash $sourcePath -Algorithm SHA256).Hash.ToLower();sourceSize=@($source.Width,$source.Height);assets=@()}
function Export-Crop($name,$x,$y,$w,$h,$icon=$false) {
 $rect=[Drawing.Rectangle]::new([int][Math]::Floor($x*$scale),[int][Math]::Floor($y*$scale),[int][Math]::Ceiling($w*$scale),[int][Math]::Ceiling($h*$scale))
 $bitmap=$source.Clone($rect,[Drawing.Imaging.PixelFormat]::Format32bppArgb)
 if($icon) {
  # The supplied glyph is dark brown on paper. Keep its original RGB; only
  # remove the light paper around/inside the glyph with an antialiased alpha mask.
  for($iy=0;$iy -lt $bitmap.Height;$iy++){for($ix=0;$ix -lt $bitmap.Width;$ix++){
   $c=$bitmap.GetPixel($ix,$iy)
   $alpha=[int]([Math]::Min(1,[Math]::Max(0,(190-$c.R)/30.0))*$c.A)
   $bitmap.SetPixel($ix,$iy,[Drawing.Color]::FromArgb($alpha,$c.R,$c.G,$c.B))
  }}
 }
 $bitmap.Save((Join-Path $assetDir "$name.png"),[Drawing.Imaging.ImageFormat]::Png)
 $manifest.assets += [ordered]@{file="$name.png";sourceRect=@($rect.X,$rect.Y,$rect.Width,$rect.Height);size=@($bitmap.Width,$bitmap.Height);processing=$(if($icon){'Original RGB; paper-only alpha mask, R=160..190 transition'}else{'Exact source crop; original alpha'})}
 $bitmap.Dispose()
}
Export-Crop 'button-rectangle' 54 54 666 168
Export-Crop 'button-ornate' 738 54 706 170
Export-Crop 'button-stepper' 54 252 174 167
Export-Crop 'icon-gear' 277 296 79 80 $true
Export-Crop 'icon-dice' 465 287 91 96 $true
Export-Crop 'icon-left' 671 292 56 84 $true
Export-Crop 'icon-right' 834 292 58 84 $true
Export-Crop 'icon-up' 973 307 83 54 $true
Export-Crop 'icon-down' 1137 307 82 54 $true
Export-Crop 'icon-upload' 1316 294 73 75 $true
Export-Crop 'icon-reset' 1457 293 73 75 $true
Export-Crop 'icon-delete' 1603 293 66 74 $true
Export-Crop 'icon-search' 1738 292 82 81 $true
Export-Crop 'icon-close' 1891 297 69 73 $true
$manifest | ConvertTo-Json -Depth 8 | Set-Content -Encoding utf8 (Join-Path $assetDir 'manifest.json')
$source.Dispose()
