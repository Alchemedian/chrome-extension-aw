#!/usr/bin/env bash
rm chrome-extension-aw.zip
zip -r chrome-extension-aw.zip chrome-extension-aw -x "*/.*"
git commit -am "updated zip"