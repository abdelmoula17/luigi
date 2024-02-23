build:
	tsc
run:
	tsc
	node ./luigi/$(main).js


dummy:
	node src/dummy.js