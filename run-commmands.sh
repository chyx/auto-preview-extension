# Install packages
npm install --save lodash
npm install --save diff
npm install --save moment
npm install --save to-time
npm install --save @types/lodash
npm install --save @types/diff
npm install --save @types/moment
npm install --save @types/to-time

# Publish extensions.
vsce package
vsce publish

