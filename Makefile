COMPOSE_FILE = docker/docker-compose.yml
COMPOSE_DEV_FILE = docker/docker-compose.override.yml
ENV_FILE ?= .env
DOCKER_COMPOSE = docker compose
UID := $(shell id -u)
GID := $(shell id -g)

.PHONY: start start-dev stop purge logs ps scan-secrets

start:
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) up --build -d

start-dev:
	DEV_UID=$(UID) DEV_GID=$(GID) $(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) -f $(COMPOSE_DEV_FILE) up --build

stop:
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) down --remove-orphans

purge:
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) down --volumes --remove-orphans

logs:
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) logs -f

ps:
	$(DOCKER_COMPOSE) --env-file $(ENV_FILE) -f $(COMPOSE_FILE) ps

scan-secrets:
	@echo "🔍 Running TruffleHog secret scan..."
	docker run --rm -v $(CURDIR):/repo ghcr.io/trufflesecurity/trufflehog:latest git file:///repo --fail --no-update
