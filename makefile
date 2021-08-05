# Docker Makefile
default: prod
VERSION=r1.0.4s

prod: 
	  docker build . -t smartnow/superset-base:$(VERSION)
	  docker push smartnow/superset-base:$(VERSION)
