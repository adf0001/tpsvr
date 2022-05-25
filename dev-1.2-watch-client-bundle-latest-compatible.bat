rem tool from tpsvr @ npm

chcp 65001

title watchify - tpsvr-client latest-compatible

node ./build/build-client-bundle.js --watchMode --compatibleMode --outputFileName bundle-client.debug.latest-compatible.js
