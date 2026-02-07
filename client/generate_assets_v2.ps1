Add-Type -AssemblyName System.Drawing
$icon = New-Object System.Drawing.Bitmap 1024, 1024
$g = [System.Drawing.Graphics]::FromImage($icon)
$blue = [System.Drawing.Color]::FromArgb(255, 56, 128, 255) # Indigo-ish
$white = [System.Drawing.Color]::White
$brush = New-Object System.Drawing.SolidBrush $blue
$g.FillRectangle($brush, 0, 0, 1024, 1024)

# Draw "Y"
$font = New-Object System.Drawing.Font "Arial", 600, [System.Drawing.FontStyle]::Bold
$brushText = New-Object System.Drawing.SolidBrush $white
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$g.DrawString("Y", $font, $brushText, 512, 512, $format)

$icon.Save("resources/icon.png", [System.Drawing.Imaging.ImageFormat]::Png)

# Splash screen (White with blue Y)
$splash = New-Object System.Drawing.Bitmap 2732, 2732
$g2 = [System.Drawing.Graphics]::FromImage($splash)
$g2.Clear($white)
$brushText2 = New-Object System.Drawing.SolidBrush $blue
$g2.DrawString("Yamishop", $font, $brushText2, 1366, 1366, $format)
$splash.Save("resources/splash.png", [System.Drawing.Imaging.ImageFormat]::Png)

Write-Host "Improved placeholders generated"
