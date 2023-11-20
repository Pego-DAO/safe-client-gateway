# Suitcase on Pego Network
This project is a fork from Gnosis Safe Global. The Suitcase project consists of the following 8 repositories. To deploy the project, go to each repo by following the sequence below and refer to steps stated in `pego-deployment.md`, which can be found in each repo.

1. [safe-singleton-factory](https://github.com/Pego-DAO/safe-singleton-factory)
2. [suitcase-contract](https://github.com/Pego-DAO/suitcase-contract)
3. [safe-transaction-service](https://github.com/Pego-DAO/safe-transaction-service)
4. **[safe-client-gateway](https://github.com/Pego-DAO/safe-client-gateway)** - Currently viewing
5. [safe-config-service](https://github.com/Pego-DAO/safe-config-service)
6. [suitcase-deployment](https://github.com/Pego-DAO/suitcase-deployment)
7. [suitcase-sdk](https://github.com/Pego-DAO/suitcase-sdk)
8. [suitcase-ui](https://github.com/Pego-DAO/suitcase-ui)

## safe-client-gateway
*Prerequisite: Smart contract in [suitcase-contract](https://github.com/Pego-DAO/suitcase-contract) have deployed successfully to the target network*

1. Create a `.env` file and copy the following code and provide value accordingly.
```
APPLICATION_VERSION=1.3.0
NGINX_HOST_PORT=80
APPLICATION_PORT=3000
EXCHANGE_API_BASE_URI=http://api.exchangeratesapi.io/v1
EXCHANGE_API_KEY=ffbcd2052fcexxxxxxx # api key of exchangeratesapi.io
SAFE_CONFIG_BASE_URI=https://config.suitcase.plus # Config service url
AUTH_TOKEN=QsOVcfYoOJYsuh1qcOAZyxxxxxxxxxxx # Random string
LOG_LEVEL=info
DEBUG=false
FF_HUMAN_DESCRIPTION=true
HTTP_CLIENT_REQUEST_TIMEOUT_MILLISECONDS=60000
DJANGO_ALLOWED_HOSTS=*
CSRF_TRUSTED_ORIGINS=https://transaction.suitcase.plus,https://config.suitcase.plus,https://gateway.suitcase.plus,http://127.0.0.1:3333,http://127.0.0.1:3000 # url of safe transaction, gateway service, config service, http://127.0.0.1:3333 and http://127.0.0.1:3000

```

2. Run this repo with docker
```
# Bring up docker container
docker compose up -d
```