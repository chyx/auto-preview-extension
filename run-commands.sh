# Install packages
npm install --save lodash
npm install --save diff
npm install --save moment
npm install --save to-time
npm install --save string-matches
npm install --save moment-precise-range-plugin

npm install --save @types/lodash
npm install --save @types/diff
npm install --save @types/moment

# Intialize new environment
npm install

# Publish extensions.
vsce package
vsce publish

