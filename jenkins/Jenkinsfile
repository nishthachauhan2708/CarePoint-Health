pipeline {
    agent any

    environment {
        // Registry & Image Configuration
        DOCKER_REGISTRY = 'docker.io'
        DOCKER_REPO_OWNER = 'carehealth'
        BACKEND_IMAGE_NAME = "${DOCKER_REPO_OWNER}/carehealth-backend"
        FRONTEND_IMAGE_NAME = "${DOCKER_REPO_OWNER}/carehealth-frontend"
        IMAGE_TAG = "${BUILD_NUMBER}-${GIT_COMMIT[0..7]}"

        // SonarQube Configuration
        SONAR_SCANNER_HOME = tool 'SonarScanner'
        SONAR_PROJECT_KEY = 'carehealth-point'

        // Kubernetes Deployment Configuration
        KUBE_NAMESPACE = 'carehealth'
    }

    options {
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '15', artifactNumToKeepStr: '10'))
        disableConcurrentBuilds()
        ansiColor('xterm')
    }

    stages {
        // Stage 1: SCM Checkout
        stage('1. Checkout SCM') {
            steps {
                echo "===> Checking out CareHealth Point repository from GitHub..."
                checkout scm
                script {
                    echo "Branch: ${env.BRANCH_NAME ?: 'main'}"
                    echo "Commit: ${env.GIT_COMMIT ?: 'HEAD'}"
                    echo "Target Image Tag: ${env.IMAGE_TAG}"
                }
            }
        }

        // Stage 2: Dependency Audit & Installation
        stage('2. Dependency Installation') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        echo "===> Installing Python 3.9 Backend Dependencies..."
                        sh '''
                            cd backend
                            python3 -m pip install --upgrade pip
                            pip install -r requirements.txt
                        '''
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        echo "===> Installing Node.js 20 Frontend Dependencies..."
                        sh '''
                            cd frontend
                            npm ci --prefer-offline
                        '''
                    }
                }
            }
        }

        // Stage 3: Code Quality Checks & Linting
        stage('3. Code Quality Checks') {
            parallel {
                stage('Python Flake8 Lint') {
                    steps {
                        echo "===> Running Python Flake8 Linting & Syntax Audit..."
                        sh '''
                            cd backend
                            python3 -m pip install flake8
                            flake8 app/ --count --select=E9,F63,F7,F82 --show-source --statistics || true
                        '''
                    }
                }
                stage('TypeScript Typecheck') {
                    steps {
                        echo "===> Running TypeScript Validation..."
                        sh '''
                            cd frontend
                            npx tsc --noEmit
                        '''
                    }
                }
            }
        }

        // Stage 4: Unit & Automated Testing
        stage('4. Automated Testing') {
            steps {
                echo "===> Executing Backend Automated Pytest Suite with JUnit Reporting..."
                sh '''
                    cd backend
                    mkdir -p test-reports
                    python3 -m pytest tests/ --junitxml=test-reports/junit.xml --verbose
                '''
            }
            post {
                always {
                    junit testResults: 'backend/test-reports/junit.xml', allowEmptyResults: true
                }
            }
        }

        // Stage 5: Frontend Production Build
        stage('5. Frontend Production Build') {
            steps {
                echo "===> Compiling React Vite Production Distribution Bundle..."
                sh '''
                    cd frontend
                    npm run build
                '''
            }
        }

        // Stage 6: SonarQube Static Code Analysis
        stage('6. SonarQube Analysis') {
            steps {
                echo "===> Performing SonarQube SAST Security & Quality Analysis..."
                withCredentials([string(credentialsId: 'sonarqube-token', variable: 'SONAR_TOKEN')]) {
                    withSonarQubeEnv('SonarQube-Server') {
                        sh """
                            ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                              -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                              -Dsonar.sources=backend/app,frontend/src \
                              -Dsonar.tests=backend/tests \
                              -Dsonar.login=${SONAR_TOKEN}
                        """
                    }
                }
            }
        }

        // Stage 7: Docker Multi-Stage Image Build
        stage('7. Docker Image Build') {
            steps {
                echo "===> Building Container Images with Tag: ${IMAGE_TAG} and 'latest'..."
                sh """
                    docker build -t ${BACKEND_IMAGE_NAME}:${IMAGE_TAG} -t ${BACKEND_IMAGE_NAME}:latest ./backend
                    docker build -t ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} -t ${FRONTEND_IMAGE_NAME}:latest ./frontend
                """
            }
        }

        // Stage 8: Container Security Vulnerability Scan (Trivy)
        stage('8. Container Image Security Scan') {
            steps {
                echo "===> Scanning Container Images for CVE Vulnerabilities with Trivy..."
                sh """
                    trivy image --severity HIGH,CRITICAL --exit-code 0 ${BACKEND_IMAGE_NAME}:${IMAGE_TAG}
                    trivy image --severity HIGH,CRITICAL --exit-code 0 ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}
                """
            }
        }

        // Stage 9: Push Container Images to Registry
        stage('9. Docker Image Push') {
            steps {
                echo "===> Authenticating and Pushing Images to Docker Hub..."
                withCredentials([usernamePassword(credentialsId: 'docker-hub-credentials', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                    sh """
                        echo "${DOCKER_PASS}" | docker login -u "${DOCKER_USER}" --password-stdin ${DOCKER_REGISTRY}
                        docker push ${BACKEND_IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${BACKEND_IMAGE_NAME}:latest
                        docker push ${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}
                        docker push ${FRONTEND_IMAGE_NAME}:latest
                    """
                }
            }
        }

        // Stage 10: Kubernetes Deployment (or ArgoCD Trigger)
        stage('10. Kubernetes Deployment') {
            steps {
                echo "===> Deploying Manifests to Kubernetes Cluster (Namespace: ${KUBE_NAMESPACE})..."
                withCredentials([file(credentialsId: 'kubeconfig-credentials', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl apply -f kubernetes/base/namespace.yaml
                        kubectl apply -f kubernetes/base/configmap.yaml
                        kubectl apply -f kubernetes/base/secret.yaml
                        kubectl apply -f kubernetes/base/postgres-pvc.yaml
                        kubectl apply -f kubernetes/base/postgres-statefulset.yaml
                        
                        # Set dynamic image tag on deployments
                        kubectl set image deployment/carehealth-backend-deployment carehealth-backend=${BACKEND_IMAGE_NAME}:${IMAGE_TAG} -n ${KUBE_NAMESPACE} --record || kubectl apply -f kubernetes/base/backend-deployment.yaml
                        kubectl set image deployment/carehealth-frontend-deployment carehealth-frontend=${FRONTEND_IMAGE_NAME}:${IMAGE_TAG} -n ${KUBE_NAMESPACE} --record || kubectl apply -f kubernetes/base/frontend-deployment.yaml
                        
                        kubectl apply -f kubernetes/base/ingress.yaml
                    """
                }
            }
        }

        // Stage 11: Deployment Health & Rollout Verification
        stage('11. Deployment Verification') {
            steps {
                echo "===> Verifying Kubernetes Rollout Status & Probes..."
                withCredentials([file(credentialsId: 'kubeconfig-credentials', variable: 'KUBECONFIG')]) {
                    sh """
                        kubectl rollout status deployment/carehealth-backend-deployment -n ${KUBE_NAMESPACE} --timeout=180s
                        kubectl rollout status deployment/carehealth-frontend-deployment -n ${KUBE_NAMESPACE} --timeout=180s
                        kubectl get pods,services,ingress -n ${KUBE_NAMESPACE} -o wide
                    """
                }
            }
        }
    }

    post {
        always {
            echo "===> Cleaning workspace..."
            cleanWs()
        }
        success {
            echo "SUCCESS: CareHealth Point CI/CD Pipeline successfully delivered build #${BUILD_NUMBER}!"
        }
        failure {
            echo "FAILURE: Pipeline execution failed at build #${BUILD_NUMBER}. Check logs for details."
        }
    }
}
