#!/bin/sh
# Copies the game from game/ into the Android assets. (web/ also contains the 3 small PWA additions, see README.)
set -e
cd "$(dirname "$0")/.."
rm -rf android/app/src/main/assets/www && mkdir -p android/app/src/main/assets/www
cp -r game/. android/app/src/main/assets/www/
echo "Android assets synced from game/."
