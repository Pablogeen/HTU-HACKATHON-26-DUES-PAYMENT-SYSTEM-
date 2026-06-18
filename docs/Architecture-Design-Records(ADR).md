# ARCHITECTURE DESIGN RECORD (ADR)

## ADR-01: BACKEND WITH JAVA SPRING BOOT FRAMEWORK

**STATUS:**

Accepted

***CONTEXT***

* Our backend system needs full control over all aspects.
* Writing every line of code and knowing how every single line of code behaves in the system.
* Better knowledge on the framework and easy to transfer knowledge to future developers.
* Spring boot provides us with rich and better ecosystem to handle our system.

***DECISION:***

We will use java 21 with spring boot framework 3.5.3 for our backend system.


***CONSEQUENCES***

**Positive**
* Rich ecosystem at our reach.
* Better knowledge on how to build systems with it.
* Transfer of knowledge becomes very easy.
* Can run huge enterprise systems with concurency, speed with low latency and high throughput.


**Negative**
* Needs much expertise to build such projects.
* Inadequate developers to start the project
* Needs much coding and reviewing


***ALTERNATIVES CONSIDERED***
* Php ***[REJECTED]***
* Next.js ***[REJECTED]***

## ADR-02: MONOLITH ARCHITECTURE VS MODULAR MONOLITH ARCHITECTURE

***STATUS***

Accepted


***CONTEXT***

Every application needs an architecture design and principles that the application needs to follow. We need:
* Application where there is no room for tight coupling.
* Modifications and changes of code will be done at ease without breaking the actual system.
* Communication should be easy and reliable within the system. 
* Let's keep it simple


***DECISION***

Modular Monolith will be used for this application.
The rich ecosystem within the box will provide simple way of handling things instead of external services to complicate things(Timeouts, traffics, Latency etc...).

***CONSEQUENCES***

**Positive**
* Loose coupling of modules
* Provides better ways for code maintainability.
* Failure in one module doesn't affect the other modules.
* Modules can be deployed independently and can be scaled when the need arises

***Negative***
* Not more engineers have much knowledge on this architecture.
* Difficult for refactoring and code reviewing for other engineers.


***ALTERNATIVES CONSIDERED***

*MicroServices:* ***[REJECTED]***
* Modular Monolith provides us with services within the box that microservice will have to use external services
* Let's just keep it simple and let us not over-engineer
* Our engineering team is not enough for microservice.

# ADR-03: MySQL for Data Storage

***STATUS***

Proposed

***CONTEXT***

Our user authentication service needs a persistent data store. We need:
* ACID for general data.
* Support for complex queries across relationships
* Strong consistency guarantees
* Mature ecosystem and tooling


Current traffic: ~50 writes/sec, ~200 reads/sec
Expected growth: 2x on each year.

***DECISION:***

***[UNDER REVIEW]***

***CONSEQUENCES***

**Positive:**
* ACID guarantees better and reliable data integrity 
* Rich query capabilities reduce application complexity 
* Large talent pool for hiring and knowledge transfer 
* JSON support provides flexibility for evolving schema

**Negative:**
* Vertical scaling limits at ~50K writes/sec 
* More complex operational overhead than managed NoSQL 
* Performance will be affected due to high indexes 
* May need read replicas sooner than with eventual consistency

***ALTERNATIVES CONSIDERED**

**Supabase: ***[UNDER REVIEW]***: 

* Handling of data load and complexities by third party system.
* Allows engineers focus only on building. Not handling of data.

*MongoDB:* **[REJECTED]**
* Weaker constitency model compared to mysql
* Would require application-level transaction handling

*MongoDB:* **[REJECTED]**
* Query limitations would push complexity to application
* Cost model less predictable at our scale


# ADR-04: SPRING APPLICATION-EVENT-LISTENER FOR ASYNC COMMUNICATION

***STATUS***

*Accepted*

***CONTEXT***

This application comprises of multiple modules communicating within each other. Therefore, we need spring's ApplicationEventListener for asychronous communication.
* Spring provides us with that out of the box
* Helps in the interacting and communication of  modules within the system.
* Decreases response times throughout the system .(Low Latency)

***DECISION***

Spring's ApplicationEventListener will be used for asynchronous communication within the modules.

***CONSEQUENCES***

**Positive:**
* Guarantees easy communication between modules
* No need for external services that can be at the verge of having network issues.
* Ensures Low latency


**Negative:**
* Cannot integrate with external applications outside our applications.
* Requires developers of only the knowledge of spring inbuilt messaging queue.


***ALTERNATIVES CONSIDERED***

*RabbitMQ* ***[REJECTED]***
- External services like RabbitMQ often requires network configurations which can break when configuration is not done properly.













