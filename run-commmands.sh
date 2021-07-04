# Install packages
npm install --save lodash
npm install --save diff
npm install --save moment
npm install --save to-time
npm install --save string-matches
npm install --save @types/lodash
npm install --save @types/diff
npm install --save @types/moment
npm install --save @types/moment-precise-range-plugin
npm install --save-dev @types/string-matches

# Publish extensions.
vsce package
vsce publish

