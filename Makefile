INTEGRATION_TESTS = test/integration/*-test.js
UNIT_TESTS = test/unit/*-test.js
ALL_TESTS = test/*/*.js
REPORTER = dot

test:
	@NODE_ENV=test ./node_modules/.bin/mocha --no-print-directory \
		--require should \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--growl \
		$(ALL_TESTS)

test-integration:
	@NODE_ENV=test ./node_modules/.bin/mocha --no-print-directory \
		--require should \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--growl \
		$(INTEGRATION_TESTS)

test-unit:
	@NODE_ENV=test ./node_modules/.bin/mocha --no-print-directory \
		--require should \
		--reporter $(REPORTER) \
		--timeout 2000 \
		--growl \
		$(UNIT_TESTS)

test-docs:
	@make test REPORTER=doc --no-print-directory \
		| cat docs/helpers/head.html - docs/helpers/tail.html \
		> docs/test.html

.PHONY: test