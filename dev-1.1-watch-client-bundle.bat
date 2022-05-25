rem tool from tpsvr @ npm

chcp 65001

title watchify - tpsvr-client

node ./build/build-client-bundle.js --watchMode --outputFileName bundle-client.debug.js
