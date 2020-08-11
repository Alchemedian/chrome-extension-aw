#!/usr/bin/env bash
rm chrome-extension-aw.zip
cd chrome-extension-aw
zip -r chrome-extension-aw.zip * -x "*/.*"
git commit -am "updated zip"