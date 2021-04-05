# Docker Makefile
default: prod
VERSION=r2021.10.0s

prod: 
	  docker build . -t psolanoc/superset-base:$(VERSION)
	  docker push psolanoc/superset-base:$(VERSION)
