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
          // Currently npm v6 is packaged with node and we need v7+
          sh 'npm install -g npm@^7.10.0'
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
        sh 'rm -f eslint_report.json'
      }
    }

    stage('Install') {
      steps {
        nvm('') {
          sh 'npm install -g npm-check'
          sh 'npm install -g @angular/cli'
          sh 'npm ci'
        }
      }
    }

    stage('License Header Check') {
      steps {
        warnError('Missing License Headers') {
          nvm('') {
            sh 'npm run license-check check'
          }
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
          junit allowEmptyResults: true, testResults: 'junit.xml'
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
          recordIssues qualityGates: [[threshold: 1, type: 'TOTAL', unstable: true]], tools: [esLint(pattern: '**/eslint_report.xml')]
        }
      }
    }

    stage('Distribution Build') {
      steps {
        nvm('') {
          catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
            sh 'npm run dist'
          }
        }
      }
    }

    // Deploy develop branch even if tests fail if the code builds, as it'll be an unstable snapshot but we should still deploy
    stage('Deploy develop to Artifactory') {
      when {
        branch 'develop'
      }
      steps {
        rtUpload(
          serverId: 'cs-artifactory',
          spec: '''{
          "files": [
            {
              "pattern": "dist/mdm-ui-*.tgz",
              "target": "artifacts-snapshots/mauroDataMapper/mdm-ui/"
            }
         ]
    }''',
          )
        rtPublishBuildInfo(
          serverId: 'cs-artifactory',
          )
      }
    }

    stage('Deploy main to Artifactory') {
      when {
        allOf {
          branch 'main'
          expression {
            currentBuild.currentResult == 'SUCCESS'
          }
        }

      }
      steps {
        rtUpload(
          serverId: 'cs-artifactory',
          spec: '''{
          "files": [
            {
              "pattern": "dist/mdm-ui-*.tgz",
              "target": "artifacts/mauroDataMapper/mdm-ui/"
            }
         ]
    }''',
          )
        rtPublishBuildInfo(
          serverId: 'cs-artifactory',
          )
      }
    }

    stage('Sonarqube') {
      when {
        branch 'develop'
      }
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

    stage('Continuous Deployment') {
      when {
        allOf {
          branch 'develop'
          expression {
            currentBuild.currentResult == 'SUCCESS'
          }
        }
      }
      steps {
        script {
          try {
            println("Triggering the [continuous-deployment] job")
            build quietPeriod: 300, wait: false, job: 'continuous-deployment'
          } catch (hudson.AbortException ignored) {
            println("Cannot trigger the [continuous-deployment] job as it doesn't exist")
          }
        }
      }
    }

  }
  post {
    always {
      publishHTML([
        allowMissing         : true,
        alwaysLinkToLastBuild: true,
        keepAll              : false,
        reportDir            : 'test-report',
        reportFiles          : 'index.html',
        reportName           : 'Test Report',
        reportTitles         : 'Test'
      ])
      outputTestResults()
      zulipNotification(topic: 'mdm-ui')
    }
  }
}
