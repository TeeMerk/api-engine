# AWS Deployment Guide: API Engine

This guide explains how to deploy the API Engine to AWS using an **EC2 Instance** (Free Tier eligible).

## 1. Prerequisites
- An AWS Account.
- A GitHub repository with your code (already linked to `https://github.com/TeeMerk/api-engine`).
- [Docker](https://docs.docker.com/engine/install/) and [Docker Compose](https://docs.docker.com/compose/install/) installed on your local machine for testing.

---

## 2. Launching the AWS EC2 Instance
1. Log in to the **AWS Management Console**.
2. Navigate to **EC2** -> **Launch Instance**.
3. **Name**: `api-engine-server`.
4. **AMI**: Amazon Linux 2023 (Free Tier eligible).
5. **Instance Type**: `t2.micro` or `t3.micro`.
6. **Key Pair**: Create or select an existing `.pem` key pair.
7. **Network Settings**:
   - Allow **SSH** (Port 22).
   - Allow **HTTP** (Port 80) for the UI.
   - Allow **Custom TCP** (Port 4000) for the Engine API.
   - Allow **Custom TCP** (Port 5432) *Only if you need external DB access (not recommended)*.

---

## 3. Server Preparation (SSH)
Connect to your instance:
```bash
ssh -i "your-key.pem" ec2-user@<EC2-PUBLIC-IP>
```

Install Docker and Git:
```bash
sudo dnf update -y
sudo dnf install -y docker git
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
# Log out and log back in for group changes to take effect
exit
```

---

## 4. Deploying the Application
Since we have a `docker-compose.yml` file, deployment is simple:

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/TeeMerk/api-engine.git
   cd api-engine
   ```

2. **Run the Stack**:
   ```bash
   docker compose up -d
   ```

3. **Initialize the Database**:
   The `api` container will run but needs the schema:
   ```bash
   docker compose exec api npx prisma db push
   ```

---

## 5. Security Group Configuration
Ensure your EC2 Security Group has the following "Inbound Rules":

| Protocol | Port | Source | Description |
| :--- | :--- | :--- | :--- |
| SSH | 22 | My IP | Admin Access |
| HTTP | 80 | 0.0.0.0/0 | Management UI |
| Custom TCP | 4000 | 0.0.0.0/0 | API Engine Ingress |

---

## 6. Continuous Deployment (Optional)
To update the server automatically when you push to GitHub:
1. Go to your GitHub Repo -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Add `EC2_SSH_KEY` (Your private `.pem` content).
3. Add `EC2_HOST` (Your EC2 Public IP).
4. Use a workflow like `appleboy/ssh-action` to run `git pull && docker compose up -d --build`.

---

## 7. Verification
- **Management UI**: `http://<EC2-IP>`
- **API Engine**: `http://<EC2-IP>:4000/healthz` (Check if healthy)
- **Live Proxy**: Test one of your configured routes at `http://<EC2-IP>:4000/<your-path>`.
