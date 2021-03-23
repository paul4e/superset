# Docker Makefile
default: prod
VERSION=r1.0.1s

prod: 
	  docker build . -t psolanoc/superset-base:$(VERSION)
	  docker push psolanoc/superset-base:$(VERSION)
