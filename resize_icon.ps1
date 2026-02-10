Add-Type -AssemblyName System.Drawing
$sourcePath = "c:\Users\laptop solutions\Desktop\SPORTS VENDOR APP\src\images\Screenshot 2026-02-10 155650.png"
$destIcon = "c:\Users\laptop solutions\Desktop\SPORTS VENDOR APP\assets\icon.png"
$destAdaptive = "c:\Users\laptop solutions\Desktop\SPORTS VENDOR APP\assets\adaptive-icon.png"

if (-not (Test-Path $sourcePath)) {
    Write-Host "Source file not found: $sourcePath"
    exit 1
}

$img = [System.Drawing.Image]::FromFile($sourcePath)
$newImg = new-object System.Drawing.Bitmap(1024, 1024)
$graph = [System.Drawing.Graphics]::FromImage($newImg)
$graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graph.DrawImage($img, 0, 0, 1024, 1024)

$newImg.Save($destIcon, [System.Drawing.Imaging.ImageFormat]::Png)
$newImg.Save($destAdaptive, [System.Drawing.Imaging.ImageFormat]::Png)

$img.Dispose()
$newImg.Dispose()
$graph.Dispose()

Write-Host "Icons resized and saved successfully."
