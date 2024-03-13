@Library('library')_

pipeline {
    agent {
        node {
            label 'jenkinsSlave'
        }
    }
    options {
        timeout(time: 10, unit: 'HOURS')
        ansiColor('xterm')
        timestamps()
    }
    parameters {
        string(
            name: 'MONKEY_BRANCH',
            defaultValue: 'stable',
            description: "Use Monkey at specific branch i.e. release_v22.02.0")
        string(
            name: 'MONKEY_TESTING_FILTER',
            defaultValue: '--regex 1_test_upgrade_happy_flow',
            description: "Regex for MonkeyTesting")
        string(
            name: 'ADDITIONAL_MONKEY_PARAMS',
            defaultValue: '',
            description: "Monkey additional parameters")
    }
    environment {
        GIT_COMMIT_MSG = "${sh (script: 'git log -1 --pretty=%B ${GIT_COMMIT}', returnStdout: true).trim()}"
        GIT_AUTHOR = "${sh (script: 'git log -1 --pretty=%cn ${GIT_COMMIT}', returnStdout: true).trim()}"
        GIT_AUTHOR_EMAIL = "${sh (script: 'git log -1 --pretty=%ae ${GIT_COMMIT}', returnStdout: true).trim()}"
        SLACK_CHANNEL = '#zcompute-system-team-ci'
        JIRA_COMPONENT= 'Upgrade'
    }
    stages {
        stage("initialization") {
            steps {
                script {
                    env.GIT_ORG = sh(script: "echo $GIT_URL | awk -F/ '{print \$4}'", returnStdout: true).trim()
                    env.GIT_REPOSITORY = sh (script: "echo $GIT_URL | awk -F/ '{print \$5}' | awk -F. '{print \$1}'", returnStdout: true).trim()
                }
                sh 'printenv'
                buildName "${env.BUILD_TAG}"
                buildDescription "${env.GIT_URL} Branch: ${env.GIT_BRANCH} on Worker: ${env.NODE_NAME}"
            }
        }
         // Verify that all new commits are in standard
        stage('Verify commits') {
            when {
                changeRequest()
            }
            steps {
                verifyCommits()
            }
        }
        // Build the build container image
        stage('Build skipper image') {
            when {
                changeRequest()
            }
            steps {
                sh 'skipper build $GIT_REPOSITORY-build'
            }
        }
        // Run linters. For example: flake8, pylint, swagger-validate
        stage('Lint') {
            when {
                changeRequest()
            }
            steps {
                sh 'skipper --build-container-tag $GIT_COMMIT make lint'
            }
        }
        // This stage will execute unittests and get coverage report
        stage('Unit tests and coverage') {
            when {
                changeRequest()
            }
            steps {
                sh 'skipper --build-container-tag $GIT_COMMIT make coverage'
            }
        }
        // Build the service image
        stage('Build service image') {
            when {
                changeRequest()
            }
            steps {
                sh 'skipper --build-container-tag $GIT_COMMIT make build'
            }
        }
        stage("Clean Build") {
            //when {
            //        anyOf {
            //            branch 'master'
            //#            expression { GIT_BRANCH ==~ /^master_v[0-9\.].+/ }
            //#        }
            //#    }
            steps {
                cleanBuild (
                    env.GIT_REPOSITORY,
                    env.GIT_COMMIT,
                    env.BUILD_TAG,
                    env.GIT_ORG,
                    env.GIT_BRANCH,
                    params.MONKEY_TESTING_FILTER,
                    params.MONKEY_BRANCH,
                    params.ADDITIONAL_MONKEY_PARAMS
                )
            }
        }
        stage("deliver") {
            when {
                anyOf {
                    branch 'master'
                    expression { GIT_BRANCH ==~ /^master_v[0-9\.].+/ }
                }
            }
            steps {
                deliver (
                    env.GIT_REPOSITORY,
                    env.GIT_COMMIT,
                    env.JIRA_COMPONENT,
                    env.GIT_AUTHOR_EMAIL,
                    env.BUILD_URL
                )
            }
        }
    }
    post {
        always{
            // Collect junit files
            junit(
                allowEmptyResults: true,
                testResults: 'reports/*.xml'
            )
            archiveArtifacts(
                allowEmptyArchive: true,
                artifacts: 'logs/*.log, logs/*.stratolog'
            )
        }
        // On every status change
        changed {
            // Notify users using email and slack
            notifyUsers(
                emailAddress: env.GIT_AUTHOR_EMAIL,
                slackChannel: env.SLACK_CHANNEL,
                buildTag: env.BUILD_TAG,
                buildUrl: env.BUILD_URL,
            )
        }
    }
}
