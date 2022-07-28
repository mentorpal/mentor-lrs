LICENSE_CONFIG?="license-config.json"

LICENSE:
	@echo "you must have a LICENSE file" 1>&2
	exit 1

LICENSE_HEADER:
	@echo "you must have a LICENSE_HEADER file" 1>&2
	exit 1
	
	
.PHONY: pretty
pretty: node_modules/prettier
	npm run format

.PHONY: lint-fix
lint-fix: node_modules/eslint
	npm run lint:fix

node_modules/eslint:
	npm ci

node_modules/mocha:
	npm ci

node_modules/prettier:
	npm ci

node_modules/typescript:
	npm ci

node_modules/license-check-and-add:
	npm ci

run-env-%:
	export ENV=$* \
	&& export NODE_PATH=$(DIR) \
	&& cp $(PROJECT_ROOT)/env/$(ENV)/.env .env \
	&& npm run start

.PHONY: test
test: node_modules/mocha
	export APP_DISABLE_AUTO_START=true \
	&& export ENV=test \
	&& export NODE_PATH=$(shell pwd)/src \
	&& npm test

.PHONY: test-all
test-all: test-format test-lint test-types test

.PHONY: test-format
test-format: node_modules/prettier
	npm run test:format

.PHONY: test-lint
test-lint: node_modules/eslint
	npm run test:lint

.PHONY: test-lint
test-types: node_modules/typescript
	npm run test:types


node_modules/license-check-and-add:
	npm ci

.PHONY: license
license: LICENSE_HEADER
	npm run license:fix

.PHONY: license-deploy
license-deploy: node_modules/license-check-and-add LICENSE LICENSE_HEADER
	LICENSE_CONFIG=${LICENSE_CONFIG} npm run license:deploy