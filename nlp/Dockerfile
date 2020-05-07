# Use the base App Engine Docker image, based on Ubuntu 16.0.4.
FROM gcr.io/google-appengine/nodejs

RUN npm install -g @google-cloud/functions-framework npm-watch

WORKDIR /opt/function
COPY package.json /opt/function/package.json
RUN npm --unsafe-perm install

ENV GOOGLE_APPLICATION_CREDENTIALS=/opt/function/credentials.json

COPY . .

EXPOSE 8090
CMD ["npm", "run", "watch"]