Thanks to the following website for help with mapping in d3: https://mappingwithd3.com/getting-started/

# Dynamic Project Scaffold

In this folder I've provided an example project that enables you to use modern javascript tooling with as little effort as possible. This scaffold includes

- a dev server that combines javascript modules and presents them to the browser. This comes with autoreload for free! It's great.
- linters and autoformaters so you'll be able to check if your writing well styled javascript code. I have some pretty strong linting in here. You can disable them if you want, but you'll be judged.



## Setup

Make sure you have npm/node/yarn installed.

```sh
npm install
# then
npm run start

# or if yarn-ing
yarn
# then
yarn start
```


You will need to be explicit about your imports, eg
```js
import {functionFromModule} from 'target-module';
```

In this scaffold I have not installed any d3 packages. Some helpful ones (read the ones I usually end up using) are d3-selection, d3-scale, and d3-shape. To add one of these packages just do

```sh
npm install --save PACKAGENAME

# or if yarning
yarn add PACKAGENAME
```

