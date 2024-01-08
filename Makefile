build:
	tsc
run:
	tsc
	node ./ugf/$(main).js


dummy:
	node src/dummy.js