# mdm-ui

Web front-end for the Mauro Data Mapper

## Build status

| Branch | Build Status |
| ------ | ------------ |
| main | [![Build Status](https://jenkins.cs.ox.ac.uk/buildStatus/icon?job=Mauro+Data+Mapper%2Fmdm-ui%2Fmain)](https://jenkins.cs.ox.ac.uk/blue/organizations/jenkins/Mauro%20Data%20Mapper%2Fmdm-ui/branches) |
| develop | [![Build Status](https://jenkins.cs.ox.ac.uk/buildStatus/icon?job=Mauro+Data+Mapper%2Fmdm-ui%2Fdevelop)](https://jenkins.cs.ox.ac.uk/blue/organizations/jenkins/Mauro%20Data%20Mapper%2Fmdm-ui/branches) |

## Requirements

Please use [NVM](https://github.com/nvm-sh/nvm) to manage the required node dependencies, and then run `npm i -g npm@7.24.1` to update to v7 of npm

## Installation

1. Clone the mdm-ui repo
1. Install NVM environment
1. Install Angular CLI
1. Install all dependencies

```shell
# Clone repo
$ git clone git@github.com:MauroDataMapper/mdm-ui.git

# Install the NVM environment
# This will use the `.nvmrc` file to install the node versions we need and update to the latest version of npm
$ nvm install --latest-npm

# Install Angular CLI
$ npm i @angular/cli

# Install the code dependencies
$ npm install
```

## Development & Testing

### Run the application

To start the application in development mode run `npm start`. After the terminal finishes compiling, open up your browser and navigate to http://localhost:4200.

Alternatively:

```bash
# Explicitly state which Angular project to test
npm start mdm-ui
```

### Testing the application

To test the application run `npm test`.

This Angular workspace uses [Jest](https://jestjs.io/) as testing framework, so any command line parameters that Jest can use can also be provided. For example:

```bash
# Explicitly state which Angular project to test
npm run test mdm-ui

# Execute test runner in watch mode. Note the "--" separator for npm to separate command line arguments
npm run test mdm-ui -- --watch
```

## Build the application

To 'export' the code for production, run `ng build --configuration production`. This will compile & minify the code, making it ready for production.

### Deployments

All pushes to the repository will invoke a Jenkins CI build.
When Jenkins runs the builds it uses `npm ci` which uses the `package-lock.json` to determine dependencies,
this is done to ensure the "Jenkins tested build" uses what will be used when we release.

Therefore if you change any dependency versions you must make sure the `package-lock` file is also updated

## MDM-Resources

We have a dependency on another repository ([mdm-resources](https://github.com/MauroDataMapper/mdm-resources)) which we develop.

The package.json file is configured to use the latest release of this module into the NPM registry,
however if you are developing mdm-resources alongside mdm-ui or you know there are changes which have not yet been released you will need to 
do the following

1. Clone the mdm-resources repository
2. Link the mdm-resources repository into your global npm
3. Link mdm-resources into mdm-ui

Once you have linked the mdm-resources repo into the global npm it will remain there until you unlink it,
you will have to re-build (`npm run build`) mdm-resources with each change for those changes to be picked up by mdm-ui,
however you dont have to re-link after the rebuild.

### Linking to mdm-resources

If you run `npm install` inside mdm-ui you will have to re-run the final link step below to re-link mdm-resources into mdm-ui.

```shell
# Clone mdm-resources
$ git clone git@github.com:MauroDataMapper/mdm-resources.git

# Link mdm-resources to global npm
$ cd mdm-resources
$ npm install
$ npm run build
$ npm link

# Link mdm-resources into mdm-ui
$ cd mdm-ui
$ npm link @maurodatamapper/mdm-resources
```

### Unlinking from mdm-resources

This is surprisingly simple just run `npm install` or `npm ci`

### Useful Tool for Links

There is a useful npm package ([symlinked](https://www.npmjs.com/package/symlinked)) which can list what modules are linked into your repository.
This is helpful if you want to check if mdm-resources is currently linked to mdm-ui.
We recommend installing this globally with `npm i -g symlinked` then you can call it inside mdm-ui using `symlinked names`.