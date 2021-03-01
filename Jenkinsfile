pipeline {
   agent any
   options {
      timestamps()
      skipStagesAfterUnstable()
      buildDiscarder(logRotator(numToKeepStr: '30'))
   }
   /*
   nvm wrapper has to wrap all steps, interestingly its not supposed to work with the .nvmrc file however if you exclude the version as a blank string
   then it passes the blank string as the version and therefore nvm just does its job and uses the .nvmrc file.
   */
   stages {
      stage('Tool Versions') {
         steps {
            nvm('') {
               sh 'node --version'
               sh 'npm --version'
            }
         }
      }
      stage('Jenkins Clean') {
         steps {
            sh 'rm -f junit.xml'
            sh 'rm -f test-report'
            sh 'rm -f coverage'
            sh 'rm -f eslint_report.json'
         }
      }
      stage('Install') {
         steps {
            nvm('') {
               sh 'npm install -g npm-check'
               sh 'npm install -g @angular/cli'
               sh 'npm install'
            }
         }
      }
      stage('Test') {
         steps {
            nvm('') {
               catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                  sh 'npm run test-with-coverage'
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
               catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                  sh 'npm run eslint-report'
               }
            }
         }
      }

      stage('Sonarqube') {
         when {
            branch 'develop'
         }
         steps {
            withSonarQubeEnv('JenkinsQube') {
               nvm('') {
                  catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                     sh 'npm run sonar'
                  }
               }
            }
         }
      }
      //    stage('Archive Build') {
      //      when {
      //        allOf {
      //          branch 'master'
      //          expression {
      //            currentBuild.currentResult == 'SUCCESS'
      //          }
      //        }
      //
      //      }
      //      steps {
      //        archiveArtifacts artifacts: '**/build/**/*.tgz'
      //      }
      //    }
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
         slackNotification()
      }
   }
}
