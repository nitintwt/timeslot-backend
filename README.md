
# Timeslot

Timeslot is a simple and scalable scheduling tool that helps users manage their availability, accept bookings, and automate meeting setup with Google Calendar and Google Meet integration. It is designed for freelancers, small businesses, and anyone who wants to streamline the scheduling process.


## Features

- Personal Booking Page: Share your unique booking link where customers can view available time slots and book meetings easily.

- Google Calendar Integration: Automatically add confirmed bookings to your Google Calendar, along with a Google Meet link.

- Real Time Updates: Track your upcoming, available, and past slots, and cancel bookings with automatic email notifications to customers.

- Dashboard Insights: View customer data, total earnings, and slot statistics from a clean dashboard.

- Payment Integration: Razorpay Integration for Timeslot monthly/yearly subscription.


## How it Works

- Create and manage available time slots from your dashboard.

- Share your booking page with customers.

- Customers book slots and make payments (if needed).

- System automatically updates your Google Calendar and sends email notifications.

- Track bookings, earnings, and customer details easily.


## Backend Architecture

- Microservices Design: Backend is divided into user-service, client-service, email-service, google-service , auth-service and payment-service for better scalability and fault tolerance.

- Redis Caching: User data is cached with Redis to reduce database load and improve performance.

- Asynchronous Email Notifications: BullMQ is used as a message queue to manage and send email notifications reliably.

- Containerized Deployment: All services are Dockerized and deployed on AWS ECS with services behind an Application Load Balancer.

- API Gateway Routing: APIs are routed via AWS API Gateway for centralized access, rate limiting, and security measures.


## Tech Stack

**Client:** React.js, Redux, TailwindCSS

**Server:** Node.js, Express.js , MongoDB , BullMQ , nodemailer , Razorpay , Google Gmail and Calendar API 

**Deployment** Docker , AWS ECS , EC2, ECR, API Gateway, Auto scaling group, Load Balancer
