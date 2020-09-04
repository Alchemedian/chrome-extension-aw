#!/usr/bin/env bash
rm chrome-extension-aw.zip
zip -r chrome-extension-aw.zip chrome-extension-aw -x "*/.*"
git add chrome-extension-aw.zip
git commit -m "updated zip"


# CURTAG=`git describe --abbrev=0 --tags`;
# IFS='.' read -a vers <<< "$CURTAG"
# MAJ=${vers[0]}
# MIN=${vers[1]}

# echo "Current Tag: $MAJ.$MIN"
# ((MIN+=1))
# NEWTAG="$MAJ.$MIN"
# echo "Adding Tag: $NEWTAG";
# # git tag -a $NEWTAG -m $NEWTAG