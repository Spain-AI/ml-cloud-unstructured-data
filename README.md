# Serverless Functions

## Code

Download the `credentials.json` file of your service account from gcloud.

Use the `function.sh` script to run the funcions locally (you'll need Docker for that)

`./functions.sh ocr develop`

`./functions.sh ocr-results develop`

`./functions.sh nlp develop`

### Invoke Locally

OCR

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"data": {"bucket": "k-webinar-spainai-2020-input", "name": "LIDL-20200102-20200108.pdf"}}' \
  http://localhost:8090
```

OCR RESULTS

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"data": {"bucket": "k-webinar-spainai-2020-output", "name": "results/ocr/LIDL-20200102-20200108/output-1-to-20.json"}}' \
  http://localhost:8090
```

NLP

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"data": {"bucket": "k-webinar-spainai-2020-input-reviews", "name": "Oikos-Caramelo_r_932849.txt"}}' \
  http://localhost:8090
```


## Cloud Resources

### Cloud Repositories

- Three repositories

### Cloud Build

- Three Cloud Build Triggers

### Cloud Storage

- Three Cloud Storage Buckets

### BigQuery

- A couple of datasets with two tables each

### Cloud Functions

- Three Funcions

### Cloud Vision and NLP

- API Requests
