  
const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Azure Blob Storage connection string and container name
const connectionString =  'DefaultEndpointsProtocol=https;AccountName=funccloudapp01hmd;AccountKey=5zBPgcUh5L2xb0KN5mwy7SAYdRVkpNJCr7az11fNbP/6krncSWQNsQ2gkTeBQrUKJac/YeOcIvgR+AStg/G29Q==;EndpointSuffix=core.windows.net';
const containerName = 'uploads';

// Create a BlobServiceClient
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.use(express.static(path.join(__dirname, 'public')));

app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const filePath = file.path;
    const blobName = file.originalname;

    // Create a container client
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Create a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Upload the file to Azure Blob Storage
    await blockBlobClient.uploadFile(filePath);

    // Remove the file from the local filesystem
    fs.unlinkSync(filePath);

    res.status(200).send(`File '${blobName}' uploaded to blob storage.`);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).send('Error uploading file.');
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});