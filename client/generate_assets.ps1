Add-Type -AssemblyName System.Drawing
$icon = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($icon)
$blue = [System.Drawing.Color]::FromArgb(255, 56, 128, 255)
$brush = New-Object System.Drawing.SolidBrush $blue
$g.FillRectangle($brush, 0, 0, 1024, 1024)
$icon.Save("resources/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

$splash = New-Object System.Drawing.Bitmap 2732, 2732
$g2 = [System.Drawing.Graphics]::FromImage($splash)
$white = [System.Drawing.Color]::White
$brush2 = New-Object System.Drawing.SolidBrush $white
$g2.FillRectangle($brush2, 0, 0, 2732, 2732)
$splash.Save("resources/splash.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Assets generated successfully"
