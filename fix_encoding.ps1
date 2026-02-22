$path = "C:\ManiKanta\coding\LoanGuard-MLOps\frontend\src\App.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# Fix rupee sign: double-encoded UTF-8
$content = $content.Replace("â‚¹", "₹")
# Fix em dash
$content = $content.Replace("â€"", "—")
# Fix middle dot
$content = $content.Replace("Â·", "·")
# Fix lightning bolt (various garbled forms)
$content = $content.Replace("âš¡", "⚡")
$content = $content.Replace("ÂŠ¡", "⚡")
# Fix 1 — Has Credit History label in dropdown
$content = $content.Replace("1 â€" Has Credit History", "1 — Has Credit History")
$content = $content.Replace("0 â€" No Credit History", "0 — No Credit History")

# Write back UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($path, $content, $utf8NoBom)
Write-Host "Fix complete"
