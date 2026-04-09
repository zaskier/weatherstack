# WeatherStack GraphQL API 🌦️

Node.js (TypeScript) GraphQL API that integrates with the Weatherstack API to manage properties and their real-time weather data.

# Technology stack

framework: Fastify
architecure graphQL rest endpoint
DB PostgreSQL
ORM : typeorm
GraphQL using mercurius
Docker
prettier, eslint
Infrastructure as a code with AWS CDK
tests with jest

## Design Patterns 🧩

The architectural goal was to build a clean, highly testable structure optimized for Test-Driven Development (TDD) and future extensibility, while maintaining a lightweight footprint:

- **Repository Pattern:** Isolates the Data Access Layer (DAL), making database operations easily mockable and decoupled from business logic.
- **Service Layer / Use Case Pattern:** Encapsulates the core business logic, ensuring controllers/resolvers remain thin.
- **Adapter / Facade Pattern:** Standardizes communication with the 3rd-party Weatherstack API, shielding the internal system from external contract changes.
- **Dependency Injection (DI):** Facilitates loose coupling and straightforward testing by injecting dependencies (like databases and API clients) rather than hardcoding them.

## Optimizations ⚡

- **In-Memory Caching:** External Weatherstack API requests are securely cached (using an LRU strategy) based on the unique combination of city and state. Data is retained in memory with a 20-minute Time-To-Live (TTL) to drastically reduce latency and conserve API quotas.
- **High-Performance Framework:** Utilizes Fastify under the hood (via Mercurius) to handle HTTP/GraphQL requests with maximum throughput and minimal overhead.
- **Database Indexing:**
  - An index is applied to the `state` column, accelerating high-level geographic filtering before narrowing down by city or zip code.
  - An index is applied to the `createdAt` column to optimize the performance of default chronological sorting.

## Features 🚀

- **GraphQL API:** Strongly typed schema with structured `Weather`, `Astro`, and `AirQuality` data.
- **Real-time Integration:** Fetches live weather data from Weatherstack for any property created.
- **Persistent Storage:** PostgreSQL with TypeORM migrations for schema management.
- **Advanced Querying:** Support for filtering by City, State, and Zip Code, plus sorting by creation date.
- **Resilience & Backoff:** Outbound exponential backoff retry logic for Weatherstack API rate limits (429) and transient failures (615).
- **Caching:** Memory-safe LRU caching (200 entries, 20-min TTL) to protect against memory leaks and reduce external API costs.
- **Robustness:** Full E2E and Unit test coverage with Jest.

## Prerequisites 🛠️

- Node.js 20+
- Docker & Docker Compose
- A Weatherstack API Key ([Get one here](https://weatherstack.com/))

## Getting Started 🏁

### 1. Environment Setup

Create a `src/.env` file with the following variables:

```env
WEATHER_API_KEY=your_api_key_here
WEATHER_API_URL=https://api.weatherstack.com/
DB_HOST=db
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=property
```

### 2. Run with Docker 🐳

To start the application and database is via Docker Compose:

```bash
docker-compose up --build
```

The API will be available at `http://localhost:8080/graphql` and the GraphiQL playground at `http://localhost:8080/graphiql`.

### 3. Local Development

```bash
npm install
npm run build
npm run dev
```

## GraphQL API Usage 📡

### Create a Property

```graphql
mutation {
  createProperty(city: "New York", street: "5th Ave", state: "NY", zipCode: "10001") {
    id
    city
    weather {
      temperature
      weatherDescriptions
      astro {
        sunrise
      }
    }
  }
}
```

### Query Properties (with Filtering/Sorting)

```graphql
query {
  properties(sortBy: "createdAt", order: "DESC", state: "NY") {
    city
    zipCode
    createdAt
    weather {
      temperature
    }
  }
}
```

## Testing 🧪

Run the full test suite (Unit + E2E):

```bash
npm test
```

## Automation Scripts 📜

We provide utility scripts to quickly populate the database with property data across 30 different USA locations.

### Standard Script (Free Tier Friendly)

Includes a 3-second delay between requests to stay within Weatherstack's free tier rate limits.

```bash
chmod +x scripts/run_usa_queries.sh
./scripts/run_usa_queries.sh
```

### Premium Script (High Speed)

No delays. Use this if you have a Professional or higher Weatherstack plan.

```bash
chmod +x scripts/run_usa_queries_weather_api_premium.sh
./scripts/run_usa_queries_weather_api_premium
```

## Business Requirement Assumptions 💼

- **Protocol Considerations (HTTP vs. HTTPS):** While HTTPS is available on most Weatherstack plans, historically the free tier required HTTP. Always verify protocol support for your specific subscription tier.
- **Consistent Naming Conventions:** Every property's weather data is defined via interfaces with strict naming conventions mapped to match the GraphQL schema standards from snake_case to CamelCase.

## Considerations and Future Enhancements 🔮

- **Rate Limiting & Throttling:** Currently, there is no request throttling. Implementing IP-based rate limiting could prevent issues like duplicate record creation from rapid double-clicks.
- **Duplicate Records:** The same property can currently be added multiple times as there is no highly specific identifier (like an apartment unit number) to enforce uniqueness. A business rule could be added to prevent exact duplicates.
- **Location Precision:** The Weatherstack API resolves location data at the city level. If future requirements demand hyper-local precision (e.g., precise street-level coordinates), the weather provider will need to be re-evaluated or replaced.
