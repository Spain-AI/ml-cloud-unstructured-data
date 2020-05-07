
var fs = require('fs');
const {Storage} = require('@google-cloud/storage');
const {BigQuery} = require('@google-cloud/bigquery');
const _language = require('@google-cloud/language');

// Creates a client
const storage = new Storage();
const bigquery = new BigQuery();
const language = new _language.LanguageServiceClient();

const bqDataset = 'insights'
const bqTable = 'reviews'

/**
 * Generic background Cloud Function to be triggered by files created in a bucket
 * @param {object} event The event payload. {"data": {"bucket": "k-webinar-spainai-2020-input-reviews", "name": "Oikos-Caramelo_r_932849.txt"}}
 */
exports.entrypoint = async (data, context) => {
    try {
        console.log('[CLOUDFUNCTION] Running function');
        // Getting metadata
        const file = data
        const fileName = file.name
        const bucket = file.bucket
        const product = fileName.split('_')[0].replace(/-/g, ' ')
        const tmpFile = `/tmp/${fileName.replace(/\//g, '-')}` 
        await storage.bucket(bucket).file(fileName).download({
            destination: tmpFile
        });
        var content = fs.readFileSync(tmpFile, 'utf8');
        const document = {
            content,
            type: 'PLAIN_TEXT',
        };
        const [resultSentiment] = await language.analyzeSentiment({document});
        const [resultEntities] = await language.analyzeEntities({document});
        const [resultCategories] = await language.classifyText({document});

        const sentiments = [resultSentiment.documentSentiment];
        const label = getLabel(sentiments)
        const entities = resultEntities.entities;
        const categories = resultCategories.categories;
        const record = {
            product,
            content,
            entities: entities.map(e => {return {name: e.name, type: e.type, salience: e.salience}}),
            sentiments: sentiments.map(s => {return {magnitude: s.magnitude, score: s.score}}),
            categories: categories.map(c => {return {name: c.name, confidence: c.confidence}}),
            label
        }
        await bigquery.dataset(bqDataset).table(bqTable).insert(record);
        fs.unlinkSync(tmpFile);
        console.log('[CLOUDFUNCTION] DONE');
        return 'ok';
    } catch (e) {
        console.error(e);
        throw new Error(e);
    }

}

// This is a perfect application for a ML model
function getLabel(sentiment) {
    const score = sentiment[0].score
    const magnitude = sentiment[0].magnitude
    if (score >= 0.5) {
        return 'POSITIVE'
    } 
    else if (score <= -0.5) {
        return 'NEGATIVE'
    }
    else if (-0.5 < score < 0) {
        if (magnitude >= 2) {
            return 'NEUTRAL'
        }
        else {
            return 'NEGATIVE'
        }
    }
    else if (0 <= score < 0.5) {
        if (magnitude >= 2) {
            return 'POSITIVE'
        }
        else {
            return 'NEUTRAL'
        }
    } else {
        return 'NEUTRAL'
    }
}
