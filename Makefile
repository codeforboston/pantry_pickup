INTEGRATION_TESTS = test/integration/*-test.js
UNIT_TESTS = test/unit/*-test.js
REPORTER = dot

test:
	@make test-unit REPORTER=$(REPORTER)
	@make test-integration REPORTER=$(REPORTER)

test-integration:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--growl \
		$(INTEGRATION_TESTS)

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require should \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--growl \
		$(UNIT_TESTS)

test-docs:
	@make test REPORTER=doc \
		| cat docs/helpers/head.html - docs/helpers/tail.html \
		> docs/test.html

.PHONY: test