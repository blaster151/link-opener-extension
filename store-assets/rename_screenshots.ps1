# Screenshot renaming script for Link Lasso

# Define the mapping of screenshot types
$screenshotTypes = @{
    "1" = "link_gathering"
    "2" = "image_gestures"
    "3" = "link_collection"
    "4" = "image_handling"
}

# Source directory where screenshots are initially saved
$sourceDir = Read-Host "Enter the source directory path where your screenshots are located"

# Destination directory
$destDir = "store-assets/screenshots"

# Ensure destination directory exists
if (-not (Test-Path $destDir)) {
    New-Item -ItemType Directory -Path $destDir | Out-Null
    Write-Host "Created destination directory: $destDir"
}

Write-Host "`nRenaming screenshots...`n"

# Get all image files
$imageFiles = Get-ChildItem -Path $sourceDir -Filter "*.png"

# Counter for naming
$counter = 1

foreach ($file in $imageFiles) {
    # Get the type description from our mapping
    $typeDesc = $screenshotTypes["$counter"]
    
    if ($typeDesc) {
        # Create new filename
        $newName = "screenshot_{0:d1}_{1}.png" -f $counter, $typeDesc
        $destPath = Join-Path $destDir $newName
        
        # Move and rename file
        Move-Item -Path $file.FullName -Destination $destPath -Force
        Write-Host "Renamed '$($file.Name)' to '$newName'"
        
        $counter++
    }
}

Write-Host "`nDone! Screenshots have been renamed and moved to $destDir"
Write-Host "Remember to verify the order is correct for the Chrome Web Store listing." 