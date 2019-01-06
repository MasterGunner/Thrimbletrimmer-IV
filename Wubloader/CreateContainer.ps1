az login

$env = Get-Content -Raw -Path ".env" | ConvertFrom-Json

$ACI_PERS_RESOURCE_GROUP = "Thrimbletrimmer"
$LOCATION = "EastUS2"
$ACI_PERS_STORAGE_ACCOUNT_NAME = "wubloader"
$STORAGE_KEY = $env.storageKey
$ACI_PERS_SHARE_NAME = "wubloader-temp"
$MOUNT_PATH = "/mnt"

az container create `
    --resource-group $ACI_PERS_RESOURCE_GROUP `
    --name "wubloader-downloader-gdq" `
    --image "quay.io/ekimekim/wubloader-downloader:446befd" `
    --dns-name-label "wub-down-demo-2" `
    --ports 80 8001 `
    --location $LOCATION `
    --azure-file-volume-account-name $ACI_PERS_STORAGE_ACCOUNT_NAME `
    --azure-file-volume-account-key $STORAGE_KEY `
    --azure-file-volume-share-name $ACI_PERS_SHARE_NAME `
    --azure-file-volume-mount-path $MOUNT_PATH `
    --command-line "python2 -m downloader --base-dir /mnt gamesdonequick --qualities 480p"

az container show --resource-group $ACI_PERS_RESOURCE_GROUP --name "wubloader-downloader-gdq" --query ipAddress.fqdn


az container create `
    --resource-group $ACI_PERS_RESOURCE_GROUP `
    --name "wubloader-backfiller-gdq" `
    --image "quay.io/ekimekim/wubloader-backfiller:446befd" `
    --dns-name-label "wub-backfill-demo" `
    --ports 80 8002 `
    --location $LOCATION `
    --azure-file-volume-account-name $ACI_PERS_STORAGE_ACCOUNT_NAME `
    --azure-file-volume-account-key $STORAGE_KEY `
    --azure-file-volume-share-name $ACI_PERS_SHARE_NAME `
    --azure-file-volume-mount-path $MOUNT_PATH `
    --command-line "python2 -m backfiller --base-dir /mnt --stream gamesdonequick --variants source,480p"
    
az container show --resource-group $ACI_PERS_RESOURCE_GROUP --name "wubloader-backfiller-gdq" --query ipAddress.fqdn



az container create `
    --resource-group $ACI_PERS_RESOURCE_GROUP `
    --name "wubloader-restreamer" `
    --image "quay.io/ekimekim/wubloader-restreamer:446befd" `
    --dns-name-label "wub-restream-demo" `
    --ports 80 `
    --location $LOCATION `
    --azure-file-volume-account-name $ACI_PERS_STORAGE_ACCOUNT_NAME `
    --azure-file-volume-account-key $STORAGE_KEY `
    --azure-file-volume-share-name $ACI_PERS_SHARE_NAME `
    --azure-file-volume-mount-path $MOUNT_PATH `
    --command-line "python2 -m restreamer --base-dir /mnt --port 80"

az container show --resource-group $ACI_PERS_RESOURCE_GROUP --name "wubloader-restreamer" --query ipAddress.fqdn


#az container delete --resource-group $ACI_PERS_RESOURCE_GROUP --name $NAME
