# mdm-ui
Web front-end for the Mauro Data Mapper

## Installation
- Clone the mdm-ui repo - ```git clone git@github.com:MauroDataMapper/mdm-ui.git``` - note that branch `develop` is the most up-to-date
- `cd` into the mdm-ui folder and run ```npm install --save --save-dev``` - this will install all dependencies
- If you need to install Angular CLI, then run `npm i @angular/cli`

### Run the application (in Dev mode)
- To start the application in Dev, run `ng serve` -> while you are still inside the mdm-ui folder. This will compile the Angular code
- After the terminal finishes compiling,  open up in your browser and navigate to  http://localhost:4200


### Build the application for production
- To 'export' the code for production, run `ng build --prod` - this will compile & minfy the code, making it ready for production



## Build status

| Branch | Build Status |
| ------ | ------------ |
| master | [![Build Status](https://jenkins.cs.ox.ac.uk/buildStatus/icon?job=Mauro+Data+Mapper%2Fmdm-ui%2Fmaster)](https://jenkins.cs.ox.ac.uk/blue/organizations/jenkins/Mauro%20Data%20Mapper%2Fmdm-ui/branches) |
| develop | [![Build Status](https://jenkins.cs.ox.ac.uk/buildStatus/icon?job=Mauro+Data+Mapper%2Fmdm-ui%2Fdevelop)](https://jenkins.cs.ox.ac.uk/blue/organizations/jenkins/Mauro%20Data%20Mapper%2Fmdm-ui/branches) |

## Requirements

Please use [NVM](https://github.com/nvm-sh/nvm) to manage the required node/npm dependencies.
