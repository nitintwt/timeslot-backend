# TimeSlot Backend

I tried to make its backend scalable and secure. Here are the steps I've taken to achieve this:

1 . Microservices Architecture: I divided the backend into different services, each handling a single task. In Timeslot , there are user-service, client-service, email-service, and google-service. Each performs a specific task, so if one service is under heavy load, it doesn’t affect the others. They are isolated from each other and can be scaled independently. If one service goes down, the others can still run.

2. Redis for Caching: I used Redis in my user-service to cache user data because the frontend fetches user details multiple times. This reduces the number of requests to the database, helping to cut costs.

3. Message Queue: When you book a time slot, the database gets updated, the google-service creates a Google Calendar event and a Google Meet link, and then the link is emailed to you. This involves heavy tasks: updating the database, creating the meet link, and sending the email. Updating the database and creating the meet link are critical tasks, so I made them synchronous. For the email-service, I used BullMQ, a message queue. The client-service pushes email tasks to BullMQ, and the email-service worker executes them.

4. Dockerized Services: I dockerized each service, created Docker images, and pushed them to AWS Elastic Container Registry. In AWS Elastic Container Service (ECS), I used AWS Fargate to make cluster for my services. All four services run on a single AWS Fargate instance. I configured different services and target groups, each with a load balancer. I ensured at least two tasks are always running, and if CPU usage goes over 70%, the number of tasks increases up to 10. This setup ensures at least two tasks (or servers) are managing the load, scaling up to 10 as needed.

5. AWS Load Balancer: It distributes the load across all running tasks to manage user requests.

6. AWS API Gateway: Different services run on different ports of the AWS load balancer. To simplify access, I used AWS API Gateway, which acts as a reverse proxy for the microservices. For example, https://lnkd.in/g-a_xm-D routes requests to different services like /client,/users, and /email. I also configured rate limiting to 100 requests per second to help prevent attacks. More configurations are needed in AWS API Gateway to secure the services since all requests pass through it. If the API Gateway is secure, all other services are also secure.

# Tech Stack :
1. Node.js
2. Express.js
3. Redis
4. BullMQ
5. Docker
6. AWS
7. Google API
