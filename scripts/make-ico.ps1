# 把一张 PNG 转成多尺寸 .ico（ICO 各帧存 PNG 数据，Vista 以后原生支持）。
# 用法: pwsh -File scripts/make-ico.ps1 -Source build\icon.png -Out build\icon.ico
param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Out,
    [int[]]$Sizes = @(16, 24, 32, 48, 64, 128, 256)
)

Add-Type -AssemblyName System.Drawing

$srcPath = (Resolve-Path -LiteralPath $Source).Path
$src = [System.Drawing.Image]::FromFile($srcPath)
$frames = New-Object System.Collections.ArrayList

foreach ($size in $Sizes) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()

    $ms = New-Object System.IO.MemoryStream
    $bmp.Save($ms, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    [void]$frames.Add(@($size, $ms.ToArray()))
    $ms.Dispose()
}
$src.Dispose()

# -Out 可能是绝对路径（构建脚本就是传绝对的），Join-Path 对绝对子路径会报错，
# 报错后 $fs 为 $null，后面 Flush/Dispose 全崩，ico 实际没写出却照样打印成功。
$outPath = if ([System.IO.Path]::IsPathRooted($Out)) { $Out } else { Join-Path (Get-Location).Path $Out }
$fs = [System.IO.File]::Create($outPath)
$bw = New-Object System.IO.BinaryWriter($fs)
$bw.Write([UInt16]0)                 # reserved
$bw.Write([UInt16]1)                 # type = icon
$bw.Write([UInt16]$frames.Count)

$offset = 6 + 16 * $frames.Count
foreach ($f in $frames) {
    $size = [int]$f[0]
    $len = $f[1].Length
    $dim = if ($size -ge 256) { 0 } else { $size }
    $bw.Write([Byte]$dim)            # width
    $bw.Write([Byte]$dim)            # height
    $bw.Write([Byte]0)               # palette
    $bw.Write([Byte]0)               # reserved
    $bw.Write([UInt16]1)             # planes
    $bw.Write([UInt16]32)            # bpp
    $bw.Write([UInt32]$len)
    $bw.Write([UInt32]$offset)
    $offset += $len
}
foreach ($f in $frames) { $bw.Write($f[1]) }

$bw.Flush()
$bw.Dispose()
$fs.Dispose()
Write-Host "ico written: $outPath ($($frames.Count) frames)"
