## PHASE 2 Deploy on dev and stage

- add infrastructure as a code with AWS CDK.
- setup app to handle 3 enviorments dev, stage, prod through .env variables.
- add deplyment pipeline.

## PHASE 3 Monitoring & performance tests

- add weather stack premium api plan and set new spi keys and dissable throtling.
- Prevent API abuse and control costs dependign on bussiness requirments.
- Add performance gatling tests to test limit of the app, based on that groom new tasks to handle and adjust app based on findings.
- improve logging , add HTTP request defined codes, add source of logs in log property. Prepare logs correlation Id if needed.
- Add http based metrics and utilised resouce based ones, based on them groom scalling based tasks.

## PHASE 4 Security

- implement in the pipeline CVE tesing on app image and adress all potential issues.
- Authentication & Authorization
- perform security audit and adress all related issues from it.

## PHASE 5 Production deployment

- Deploy on production
- Properly test the production enviorment
