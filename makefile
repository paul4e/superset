# Docker Makefile
default: prod
VERSION=r2021.10.0s

prod: 
	  docker build . -t smartnow/superset-base:$(VERSION)
	  docker push smartnow/superset-base:$(VERSION)
