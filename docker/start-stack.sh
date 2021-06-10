FULL_PATH_TO_SCRIPT="$(realpath "$0")"
SCRIPT_DIRECTORY="$(dirname "$FULL_PATH_TO_SCRIPT")"
docker-compose -f ${SCRIPT_DIRECTORY}/stack.yml up