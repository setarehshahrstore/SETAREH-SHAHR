$current = [System.IO.File]::ReadAllText("src\components\Storefront.tsx", [System.Text.Encoding]::UTF8)
$backup = [System.IO.File]::ReadAllText("src\components\Storefront_backup.tsx", [System.Text.Encoding]::UTF8)

$heroStart = $backup.IndexOf('{/* --- 2. Hero Section --- */}')
$wholesaleStart = $backup.IndexOf('{/* --- 5. Wholesale & Retail System --- */}')
$footerStart = $backup.IndexOf('{/* --- 9. Footer --- */}')

$part1 = $backup.Substring($heroStart, $wholesaleStart - $heroStart)

$bestSellingStart = $part1.IndexOf('{/* --- 4. Best Selling Products --- */}')
if ($bestSellingStart -gt 0) {
    $part1 = $part1.Substring(0, $bestSellingStart)
}

$part2 = $backup.Substring($wholesaleStart, $footerStart - $wholesaleStart)

$sections = $part1 + $part2

$headerStart = $current.IndexOf('{/* Header */}')
$catalogStart = $current.IndexOf('{/* Main Catalog */}')

$modified = $current.Substring(0, $headerStart) + $sections + $current.Substring($catalogStart)

$modified = [regex]::Replace($modified, "import \{([^}]+)\} from 'lucide-react';", "import { `$1, Phone, Tag, Star, Users, Truck, ArrowLeft, Mail, MapPin, Clock, ShieldCheck, MessageCircle, ChevronLeft, Droplets, Coffee, Home, Baby, Box } from 'lucide-react';")
if (-not $modified.Contains("motion/react")) {
    $modified = [regex]::Replace($modified, "(import React[^;]+;)", "`$1`nimport { motion, AnimatePresence } from 'motion/react';")
}

[System.IO.File]::WriteAllText("src\components\Storefront.tsx", $modified, [System.Text.Encoding]::UTF8)
Write-Output "Done!"
