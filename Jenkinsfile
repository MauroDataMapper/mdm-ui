pipeline {
  agent any

  options {
    timestamps()
    skipStagesAfterUnstable()
    buildDiscarder(logRotator(numToKeepStr: '30'))
  }
  node {
    nvm('v12.16.1')
  }
  stages {

    stage('NVM version check') {
      steps {
        sh 'nvm use'
      }
    }

    stage('Tool Versions') {
      steps {
        sh 'node --version'
        sh 'npm --version'
      }
    }

    stage('Install') {
      steps {
        sh 'npm install -g npm-check'
        sh 'npm install -g @angular/cli'
        sh 'npm install'
      }
    }

    stage('Build & Test') {
      steps {
        sh 'ng lint'
        sh 'ng test --coverage'
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'test_results/*.xml'
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
      slackNotification()
    }
  }
}
