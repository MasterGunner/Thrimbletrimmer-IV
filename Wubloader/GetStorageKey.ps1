$ACI_PERS_RESOURCE_GROUP = "Thrimbletrimmer"
$ACI_PERS_STORAGE_ACCOUNT_NAME = "wubloader"

$STORAGE_KEY=$(az storage account keys list --resource-group $ACI_PERS_RESOURCE_GROUP --account-name $ACI_PERS_STORAGE_ACCOUNT_NAME --query "[0].value" --output tsv)
echo $STORAGE_KEY