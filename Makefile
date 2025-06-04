build:
	docker build . -t atm-insights-frontend:latest --no-cache

run:
	docker ps -a -q -f name=atm-insights-frontend | grep -q . && docker rm -f atm-insights-frontend || echo "Container not running or doesn't exist"
	docker run -p 9999:9999 --name atm-insights-frontend -d atm-insights-frontend:latest