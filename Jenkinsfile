pipeline {
  agent any
  options {
    timestamps()
    skipStagesAfterUnstable()
    buildDiscarder(logRotator(numToKeepStr: '30'))
  }
  /*
  nvm wrapper has to wrap all steps, interestingly its not supposed to work with the .nvmrc file however if you exclude the version as a blank
  string
  then it passes the blank string as the version and therefore nvm just does its job and uses the .nvmrc file.
  */
  stages {
    stage('Tool Versions') {
      steps {
        nvm('') {
          sh 'npm i -g npm@8.3.0'
          sh 'node --version'
          sh 'npm --version'
        }
      }
    }
    stage('Jenkins Clean') {
      steps {
        sh 'rm -f junit.xml'
        sh 'rm -rf test-report'
        sh 'rm -rf coverage'
        sh 'rm -rf dist'
        sh 'rm -f eslint_report.json'
      }
    }

    stage('Install Global') {
      steps {
        nvm('') {
          sh 'npm install -g npm-check'
          sh 'npm install -g @angular/cli'
          sh 'npm install -g symlinked'
        }
      }
    }

    stage('Install Dependencies') {
      when {
        not {
          branch 'main'
        }
      }
      steps {
        nvm('') {
          sh 'npm ci'
          sh 'npm link @maurodatamapper/mdm-resources'
          sh 'symlinked names'
        }
      }
    }

    stage('Clean Install Dependencies') {
      when {
        branch 'main'
      }
      steps {
        nvm('') {
          sh 'npm ci'
          sh 'symlinked names'
        }
      }
    }

    stage('Test') {
      steps {
        nvm('') {
          catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
            sh 'npm run test-with-coverage'
            sh 'npm run test-clearCache'
            sh "rm -rf /tmp/jest_${JOB_BASE_NAME}"
          }
        }
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test-report/junit.xml'
          publishCoverage adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')], sourceFileResolver: sourceFiles('NEVER_STORE')
          publishHTML([
            allowMissing         : true,
            alwaysLinkToLastBuild: true,
            keepAll              : false,
            reportDir            : 'test-report',
            reportFiles          : 'index.html',
            reportName           : 'Test Report',
            reportTitles         : 'Test'
          ])
        }
      }
    }
    stage('Lint') {
      steps {
        nvm('') {
          catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
            sh 'npm run eslint-report'
          }
        }
      }
      post {
        always {
         recordIssues qualityGates: [[threshold: 1, type: 'TOTAL_ERROR', unstable: true], [threshold: 1, type: 'TOTAL_HIGH', unstable: true]], tools: [esLint(pattern: '**/eslint_report.xml')]
        }
      }
    }

    stage('Sonarqube') {
      steps {
        withSonarQubeEnv('JenkinsQube') {
          nvm('') {
            catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
              sh 'npm run sonar'
            }
          }
        }
      }
    }
  }

}
