#!/bin/sh

if [ "$START_MODE" = "migrate" ]; then
  yarn start:migrate:prod
elif [ "$START_MODE" = "prod" ]; then
  yarn start:prod
else
  yarn start:dev
fi