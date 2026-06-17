$current = [System.IO.File]::ReadAllText("src\components\Storefront.tsx", [System.Text.Encoding]::UTF8)
$good = [System.IO.File]::ReadAllText("..\temp-worktree\src\components\Storefront.tsx", [System.Text.Encoding]::UTF8)

$heroStart = $good.IndexOf('{/* --- 2. Hero Section --- */}')
$wholesaleStart = $good.IndexOf('{/* --- 5. Wholesale & Retail System --- */}')
$footerStart = $good.IndexOf('{/* --- 9. Footer --- */}')

$part1 = $good.Substring($heroStart, $wholesaleStart - $heroStart)

$bestSellingStart = $part1.IndexOf('{/* --- 4. Best Selling Products --- */}')
if ($bestSellingStart -gt 0) {
    $part1 = $part1.Substring(0, $bestSellingStart)
}

$part2 = $good.Substring($wholesaleStart, $footerStart - $wholesaleStart)

$sections = $part1 + $part2

$garbledStart = $current.IndexOf('{/* --- 2. Hero Section --- */}')
$catalogStart = $current.IndexOf('{/* Main Catalog */}')

$modified = $current.Substring(0, $garbledStart) + $sections + "`n      " + $current.Substring($catalogStart)

[System.IO.File]::WriteAllText("src\components\Storefront.tsx", $modified, [System.Text.Encoding]::UTF8)
Write-Output "Fixed!"
