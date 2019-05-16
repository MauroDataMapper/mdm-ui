pipeline {
    agent any

    options {
        timestamps()
        skipStagesAfterUnstable()
        buildDiscarder(logRotator(numToKeepStr: '30'))
    }

    tools {
        nodejs '10.15.3'
    }

    stages {

        stage('Tool Versions') {
            steps {
                sh 'node --version'
                sh 'npm --version'
                sh 'npm install -g npm-check'
            }
        }

        stage('Build & Test') {
            steps {
                dir('Core') {
                    sh 'npm install'
                    sh 'npm-check || true'
                    sh 'npm build'
                    sh 'npm test:dist'
                }
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'test_results/*.xml'
                }
            }
        }

        stage('Archive Build') {
            when {
                allOf {
                    branch 'master'
                    expression {
                        currentBuild.currentResult == 'SUCCESS'
                    }
                }

            }
            steps {
                archiveArtifacts artifacts: '**/build/**/*.tgz'
            }
        }
    }

    post {
        always {
            slackNotification()
        }
    }
}