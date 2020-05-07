
var fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const {BigQuery} = require('@google-cloud/bigquery');

// Creates a client
const storage = new Storage();
const bigquery = new BigQuery();

const bqDataset = 'insights'
const bqTable = 'catalog'

/**
 * Generic background Cloud Function to be triggered by files created in a bucket
 * @param {object} event The event payload. {"data": {"bucket": "k-webinar-spainai-2020-output", "name": "results/ocr/LIDL-20200102-20200108/output-1-to-20.json"}}
 */
exports.entrypoint = async (data, context) => {
    try {
        console.log('[CLOUDFUNCTION] Running function');
        // Getting metadata
        const file = data
        const fileName = file.name
        const bucket = file.bucket
        const tmpFile = `/tmp/${fileName.replace(/\//g, '-')}` 
        await storage.bucket(bucket).file(fileName).download({
            destination: tmpFile
        });
        var data = JSON.parse(fs.readFileSync(tmpFile, 'utf8'));
        const sourceFile = data.inputConfig.gcsSource.uri
        const sourceFileNameParts = sourceFile.split('/')[sourceFile.split('/').length-1].split('.')[0].split('-')
        const chain = sourceFileNameParts[0]
        const startDate = `${sourceFileNameParts[1].substr(0,4)}-${sourceFileNameParts[1].substr(4,2)}-${sourceFileNameParts[1].substr(6,2)}`
        const endDate = `${sourceFileNameParts[2].substr(0,4)}-${sourceFileNameParts[2].substr(4,2)}-${sourceFileNameParts[2].substr(6,2)}`
        const records = data.responses.map(p => {
            return {
                file: sourceFile,
                chain,
                startDate,
                endDate,
                page: p.context.pageNumber,
                text: p.fullTextAnnotation.text
            }
        })
        await bigquery.dataset(bqDataset).table(bqTable).insert(records);
        fs.unlinkSync(tmpFile);
        console.log('[CLOUDFUNCTION] DONE');
        return 'ok';
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }

}