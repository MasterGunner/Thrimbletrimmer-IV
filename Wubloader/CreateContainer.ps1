az login

$env = Get-Content -Raw -Path ".env" | ConvertFrom-Json

$ACI_PERS_RESOURCE_GROUP = "Thrimbletrimmer"
$NAME = "wubloader-downloader"
$IMAGE = "quay.io/ekimekim/wubloader-downloader:latest" 
#$IMAGE = "quay.io/ekimekim/wubloader-restreamer:latest"
$DNS_NAME = "wub-down-demo"
$ACI_PERS_STORAGE_ACCOUNT_NAME = "wubloader"
$STORAGE_KEY = $env.storageKey
$ACI_PERS_SHARE_NAME = "wubloader-temp"
$MOUNT_PATH = "/mnt"
$COMMAND_LINE = "python2 -m downloader --base-dir /mnt seabats"

az container create `
    --resource-group $ACI_PERS_RESOURCE_GROUP `
    --name $NAME `
    --image $IMAGE `
    --dns-name-label $DNS_NAME `
    --ports 80 `
    --location "EastUS2" `
    --azure-file-volume-account-name $ACI_PERS_STORAGE_ACCOUNT_NAME `
    --azure-file-volume-account-key $STORAGE_KEY `
    --azure-file-volume-share-name $ACI_PERS_SHARE_NAME `
    --azure-file-volume-mount-path $MOUNT_PATH `
    --command-line $COMMAND_LINE
    

$ACI_PERS_RESOURCE_GROUP = "Thrimbletrimmer"
$NAME = "wubloader-restreamer"
$IMAGE = "quay.io/ekimekim/wubloader-restreamer:22df6f0"
$DNS_NAME = "wub-restream-demo"
$ACI_PERS_STORAGE_ACCOUNT_NAME = "wubloader"
$STORAGE_KEY = $env.storageKey
$ACI_PERS_SHARE_NAME = "wubloader-temp"
$MOUNT_PATH = "/mnt"
$COMMAND_LINE = "python2 -m restreamer --base-dir /mnt --port 80"

az container create `
    --resource-group $ACI_PERS_RESOURCE_GROUP `
    --name $NAME `
    --image $IMAGE `
    --dns-name-label $DNS_NAME `
    --ports 80 `
    --location "EastUS2" `
    --azure-file-volume-account-name $ACI_PERS_STORAGE_ACCOUNT_NAME `
    --azure-file-volume-account-key $STORAGE_KEY `
    --azure-file-volume-share-name $ACI_PERS_SHARE_NAME `
    --azure-file-volume-mount-path $MOUNT_PATH `
    --command-line $COMMAND_LINE

az container show --resource-group $ACI_PERS_RESOURCE_GROUP --name $NAME --query ipAddress.fqdn


#az container delete --resource-group $ACI_PERS_RESOURCE_GROUP --name $NAME