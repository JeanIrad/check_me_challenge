# CheckMe Ltd: Patient Symptom Logger & Insights Dashboard

## Project Overview

This application was built for the CheckMe Ltd Software Development Intern Technical Challenge. It serves as a simplified healthcare platform where patients can log their symptoms, and clinicians can view generated trends and automated alerts.

The goal of this system is to transform raw symptom data into actionable clinical insights, highlighting worsening conditions or frequent severe symptoms to enable early intervention.

---

## Tech Stack

### Backend

- **Framework:** [NestJS](https://nestjs.com/) (TypeScript)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** PostgreSQL
- **Validation:** `class-validator` & `class-transformer`
- **Utility:** `date-fns` (for complex date manipulation)
- **API Documentation:** Swagger UI (`@nestjs/swagger`)

### Frontend _(Adapt this section based on what you used)_

- **Framework:** React / Next.js
- **Styling:** Tailwind CSS / Material UI
- **State Management / Data Fetching:** Axios / React Query

---

## Database Choice Justification

**Why PostgreSQL and Prisma?**
Healthcare data is inherently relational. A `Patient` has a strict one-to-many relationship with their `Symptoms`.

1. **PostgreSQL** was chosen because we need ACID compliance and strict data integrity. Using constraints (like Enums for predefined symptom types and Foreign Keys with Cascade Deletes) ensures no orphaned records. Furthermore, indexing `patientId` and `dateOfOccurrence` heavily optimizes the time-series queries required by the Insights engine.
2. **Prisma ORM** was chosen to guarantee end-to-end type safety. By utilizing Prisma's auto-generated types, we prevent runtime errors when passing data between the database and the NestJS controllers.

---

## Design Decisions & Assumptions

### 1. The Insights Engine (Business Logic)

The `GET /patients/:id/insights` endpoint is the core of the application.

- **Database Optimization:** Instead of making multiple queries for the 7-day, prior 7-day, and 30-day windows, the service makes **one single query** to fetch the last 30 days of symptoms. The data is then partitioned and aggregated in-memory using TypeScript and `date-fns`. This vastly reduces database load.
- **Edge Cases Handled:** If a new patient registers but has zero symptoms logged, the engine gracefully returns a `stable` trend and `null` top symptom rather than throwing a divide-by-zero error or crashing.

### 2. Strict Input Validation

Clinicians cannot rely on dirty data. I implemented global validation pipes using `class-validator`. The system strictly rejects:

- Symptom severities outside the `1-5` range.
- Invalid symptom types not present in the Prisma Enum.
- Malformed dates (enforcing strict ISO 8601 formatting).

---

## 🚀 Setup and Run Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL running locally or via Docker

### 1. Clone the repository

```bash
git clone [https://github.com/jeanirad/check_me_challenge.git](https://github.com/jeanirad/check_me_challenge.git)
cd check_me_challenge
```
