#!/bin/bash

set -e

# As argument is not related to php-fpm,
# then assume that user wants to run his own process,
# for example a `bash` shell to explore this image
exec "$@"