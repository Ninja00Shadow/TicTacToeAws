$tempDir = "tempDir"
New-Item -ItemType Directory -Force -Path $tempDir
git ls-files | ForEach-Object {
    $src = $_
    $dest = Join-Path -Path $tempDir -ChildPath $_
    $destDir = [System.IO.Path]::GetDirectoryName($dest)
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Force -Path $destDir
    }
    Copy-Item -Path $src -Destination $dest
}
Compress-Archive -Path "$tempDir\*" -DestinationPath "../TicTacToeAws.zip"
Remove-Item -Force -Recurse -Path $tempDir
