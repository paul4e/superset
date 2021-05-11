# Docker Makefile
default: prod
VERSION=r1.0.2s

prod: 
	  docker build . -t smartnow/superset-base:$(VERSION)
	  docker push smartnow/superset-base:$(VERSION)
