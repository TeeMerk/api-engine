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

## 4. Database: RDS Setup (Recommended)
For production persistence, use **AWS RDS** instead of a local Docker container.

1.  **Create RDS Instance**:
    - Go to **RDS** -> **Create Database**.
    - Choose **PostgreSQL**.
    - **Templates**: Free Tier.
    - **Settings**: Set your Master username and Password.
2.  **🎁 Automatic Connectivity (Smart Choice)**:
    - Under **Connectivity**, look for **"Connect to an EC2 compute resource"**.
    - Select your `api-engine-server` instance.
    - **Impact**: AWS will automatically create the internal Security Group rules allowing your EC2 to talk to RDS. You won't have to manually edit inbound rules for Port 5432.
3.  **Get connection string**:
    - Once created, copy the **Endpoint**.
    - Your URL will look like: `postgresql://username:password@endpoint:5432/postgres`.

---

## 5. Deploying the Application

### Option A: Fully Dockerized (Local DB)
Use this for testing or simple setups:
```bash
docker compose up -d
```

### Option B: Production (EC2 + RDS)
1.  **Clone & Configure**:
    ```bash
    git clone https://github.com/TeeMerk/api-engine.git
    cd api-engine
    ```
2.  **Define RDS URL**:
    Create an `.env` file or export the variable:
    ```bash
    export DATABASE_URL="postgresql://user:pass@your-rds-endpoint:5432/dbname"
    ```
3.  **Run API & UI**:
    Start only the application containers (skipping the local `db` service):
    ```bash
    docker compose up -d api ui
    ```
4.  **Sync Schema**:
    ```bash
    docker compose exec api npx prisma db push
    ```

---

## 6. Security Group Configuration
If you used the **"Connect to EC2"** feature for RDS, you only need to manage the external ports:

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
