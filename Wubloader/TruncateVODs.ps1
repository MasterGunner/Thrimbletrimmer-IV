# Input bindings are passed in via param block.
param($Timer)

# The 'IsPastDue' porperty is 'true' when the current function invocation is later than scheduled.
if ($Timer.IsPastDue) {
    Write-Host "PowerShell timer is running late!"
}

$env = Get-Content -Raw -Path ".env" | ConvertFrom-Json

$storageAccountName = "wubloader"
$storageAccountKey = $env.storageKey
$fileShare = "wubloader-temp"
$targetStream = "seabats"

$context = New-AzStorageContext -StorageAccountName $storageAccountName -StorageAccountKey $storageAccountKey
$files = $context | Get-AzStorageFile -ShareName $fileShare -Path $targetStream | Get-AzStorageFile | Get-AzStorageFile | ? { (Get-Date ($_.Name+":00:00")) -lt (Get-Date).AddDays(-7) }
$files | % {
    Get-AzStorageFile -Directory $_ | Remove-AzStorageFile
    Remove-AzStorageDirectory -Directory $_
}

# Get the current universal time in the default string format
$currentUTCtime = (Get-Date).ToUniversalTime()
# Write an information log with the current time.
Write-Host "PowerShell timer trigger function ran! TIME: $currentUTCtime"