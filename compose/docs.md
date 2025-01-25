# Prod Server.

1. Using this:

   ```services:
   insights-of-a-trader:
    image: bryan890/insights-of-a-trader:latest
    ports:
      - "127.0.0.1:3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - db
    restart: unless-stopped
   db:
    image: postgres:14.15
    container_name: postgres
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: root_admin_user
      POSTGRES_PASSWORD: jdsnf34r43£jg30£$
      POSTGRES_DB: insights-of-a-trader-db
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped
   volumes:
   postgres-data:
   ```

   Do a 'sudo docker compose -f compose/docker-compose.yaml up db' to just start the db

2. Connect to the db over pgAdmin using above credentials and server IP

3. SQL Dump

4. Add application_user with login privilage + password.

5. public -> properties -> security -> U privilage

6. Table -> Grant Wizard

7. Do a sudo docker exec -it container_id bash

8. apt update && apt install nano -y

9. Go to: root@aa7613053b0e:/var/lib/postgresql/data# ls

10. nano pg_hba.conf

11. Update to:

```

# TYPE  DATABASE        USER            ADDRESS                 METHOD

# "local" is for Unix domain socket connections only
local   all             root_admin_user                                     trust
# IPv4 local connections:
host    all             root_admin_user             127.0.0.1/32            trust
# IPv6 local connections:
host    all             root_admin_user             ::1/128                 trust
host    all             root_admin_user             86.42.104.192/32        scram-sha-256
# Allow replication connections from localhost, by a user with the
host    all             application_user            172.18.0.0/16           scram-sha-256
# replication privilege.
local   replication     all                                     trust
host    replication     all             127.0.0.1/32            trust
host    replication     all             ::1/128                 trust
```

12. sudo docker compose -f compose/docker-compose.yaml down db

13. docker pull bryan890/insights-of-a-trader:latest

14. Do a sudo docker compose -f compose/docker-compose.yaml up

15. Change docker-compose to:
