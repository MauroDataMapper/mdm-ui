# mdm-ui

Web front-end for the Mauro Data Mapper

## Build status

| Branch | Build Status |
| ------ | ------------ |
| main | [![Build Status](https://jenkins.cs.ox.ac.uk/buildStatus/icon?job=Mauro+Data+Mapper%2Fmdm-ui%2Fmain)](https://jenkins.cs.ox.ac.uk/blue/organizations/jenkins/Mauro%20Data%20Mapper%2Fmdm-ui/branches) |
| develop | [![Build Status](https://jenkins.cs.ox.ac.uk/buildStatus/icon?job=Mauro+Data+Mapper%2Fmdm-ui%2Fdevelop)](https://jenkins.cs.ox.ac.uk/blue/organizations/jenkins/Mauro%20Data%20Mapper%2Fmdm-ui/branches) |

## Requirements

Please use [NVM](https://github.com/nvm-sh/nvm) to manage the required node/npm dependencies.

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

* To start the application in development mode run `ng serve`
* After the terminal finishes compiling, open up your browser and navigate to http://localhost:4200

### Testing the application

* To test the application run `npm test`

All pushes to the repository will invoke a Jenkins CI build.
When Jenkins runs the builds it uses `npm ci` which uses the `package-lock.json` to determine dependencies,
this is done to ensure the "Jenkins tested build" uses what will be used when we release.

Therefore if you change any dependency versions you must make sure the `package-lock` file is also updated

## MDM-Resources

We have a dependency on another repository ([mdm-resources](https://github.com/MauroDataMapper/mdm-resources)) 
which is not currently published to NPM .

* The `develop` branch of this repo tracks the develop branch of mdm-resources
* The `main` branch of this repo tracks a specific tagged release of mdm-resources

If any updates are made to the mdm-resources repo then to allow Jenkins to build successfully you will need to update the
`package-lock.json` which points to a specific commit hash for mdm-resources.
This can be done by running

```shell
$ npm update @maurodatamapper/mdm-resources
```

### `develop` branch

We have the `develop` branch set with a dependency of:

```json
 "@maurodatamapper/mdm-resources": "git+https://github.com/MauroDataMapper/mdm-resources.git#develop",
```

### `main` branch

We have the `main` branch set with a dependency of:

```json
 "@maurodatamapper/mdm-resources": "git+https://github.com/MauroDataMapper/mdm-resources.git#<RELEASE_TAG>",
```

Where the `RELEASE_TAG` is the stable tagged release of mdm-resources we need for the release of mdm-ui.

## Build the application

To 'export' the code for production, run `ng build --prod` this will compile & minify the code, making it ready for production