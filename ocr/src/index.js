
const _vision = require('@google-cloud/vision');
const clientOptions = { apiEndpoint: 'eu-vision.googleapis.com' };

const vision = new _vision.ImageAnnotatorClient(clientOptions);

const bucketOut = 'k-webinar-spainai-2020-output'
const outputPrefix =  'results/ocr'


/**
 * Generic background Cloud Function to be triggered by files created in a bucket
 * @param {object} event The event payload. {"data": {"bucket": "k-webinar-spainai-2020-input", "name": "LIDL-20200102-20200108.pdf"}}
 */
exports.entrypoint = async (data, context) => {
    try {
        console.log('[CLOUDFUNCTION] Running function');
        // Getting metadata
        const file = data
        const fileName = file.name
        const bucket = file.bucket
        const gcsSourceUri = `gs://${bucket}/${fileName}`;
        const gcsDestinationUri = `gs://${bucketOut}/${outputPrefix}/${fileName.split('.')[0]}/`;

        const inputConfig = {
            mimeType: 'application/pdf',
            gcsSource: {
                uri: gcsSourceUri,
            },
        };
        const outputConfig = {
            gcsDestination: {
                uri: gcsDestinationUri,
            },
        };
        const features = [{ type: 'DOCUMENT_TEXT_DETECTION' }];
        const request = {
            requests: [
                {
                    inputConfig: inputConfig,
                    features: features,
                    outputConfig: outputConfig,
                },
            ],
        };

        await vision.asyncBatchAnnotateFiles(request);
        console.log('[CLOUDFUNCTION] Done');
        return 'ok';
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }

}