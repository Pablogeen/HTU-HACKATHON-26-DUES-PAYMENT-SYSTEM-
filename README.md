## DUES PAYMENT SYSTEM 

This application is a spring boot application following Modular Monolith Architecture using [Spring Modulith](https://spring.io/projects/spring-modulith).
The purpose of this application is to streamline dues collection and tracking
platform for student associations - enabling members to pay, admins to manage records and leadership 
to generate reports


![high-level-design(HLD).png](docs/high-level-design(HLD).excalidraw.png)

# MODULES

* ***STUDENT MODULE***

This module manages the details of the students which are eligible to make payments. Staff and Financial Secretary also within this module which they can manage all students within the system.

* ***PAYMENT MODULE***

This module enables us to integrate with a third party payment provider(PAYSTACK) to make payments and handle all lifecycle of payments within the system.

* ***FINANCIAL REPORTS && RECEIPTS MODULE***

This module implements financial report generation for further assessment of the departments and generation of receipts to paid users or students.

* ***NOTIFICATION MODULE***

This module handles events published by other modules and send notifications to the interested modules. This prevents us from calling each module directly which prevents loose coupling.


# Module Communication
* The **Student Module** publishes an event ***[StudentLoginEvent]*** to the notification module after login.
* **Notification Module** consumes ***[StudentLoginEvent}*** to fire a One Time Password(OTP) notification to the user/student to be authenticated to the system
* After payment is being done by the user/student, **Payment Module** publishes an event ***[PaymentSucceededEvent]***
* **Receipts && Financial Reports Module** will consume ***[PaymentSucceededEvent]*** to generate receipts for the user/student.
* **Notification Module** consumes ***[PaymentSucceededEvent]*** to send a notification for payment succeeded to the user/student.


## Prerequisites
* JDK 21+
* Your favourite IDE (Recommended: [IntelliJ IDEA](https://www.jetbrains.com/idea/))

## Branches
* Master
* Integration
* Feature Branches...

## URL
* **Frontend**: https://payment-system-ten-chi.vercel.app
* **Backend Api Docs** https://htu-hackathon-26-dues-payment-system.onrender.com/swagger-ui.html

[Frontend Docs](frontend/README.md)

[Architecture-Design-Record(ADR)](docs/Architecture-Design-Records(ADR).md)


