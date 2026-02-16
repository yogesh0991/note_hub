# My Collection - Spring Boot Application

A simple collection management web application built with Spring Boot, MySQL, HTML, CSS, and JavaScript.

## Features

- View collection items with images, titles, descriptions, and tags
- Add new items via modal form
- Edit existing items
- Delete items
- Search items by title or description
- Filter items by tags
- View all available tags in sidebar

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL 8.0+
- MySQL server running on localhost:3306

## Setup Instructions

### 1. Database Setup

Create a MySQL database (or let the application create it automatically):

```sql
CREATE DATABASE IF NOT EXISTS collection_db;
```

Update database credentials in `src/main/resources/application.properties` if needed:
- Default username: `root`
- Default password: `root`
- Default database: `collection_db`

### 2. Build and Run

```bash
# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The application will start on `http://localhost:8080`

### 3. Access the Application

Open your browser and navigate to:
```
http://localhost:8080
```

## Project Structure

```
src/
├── main/
│   ├── java/com/collection/
│   │   ├── CollectionApplication.java    # Main Spring Boot application
│   │   ├── entity/
│   │   │   └── Item.java                 # Item entity class
│   │   ├── repository/
│   │   │   └── ItemRepository.java       # JPA repository
│   │   ├── service/
│   │   │   └── ItemService.java          # Business logic
│   │   ├── controller/
│   │   │   └── ItemController.java       # REST API endpoints
│   │   └── config/
│   │       └── WebConfig.java            # CORS and resource configuration
│   └── resources/
│       ├── application.properties        # Database configuration
│       └── static/
│           ├── index.html                # Frontend HTML
│           ├── styles.css                # Frontend CSS
│           └── script.js                 # Frontend JavaScript
└── pom.xml                               # Maven dependencies
```

## API Endpoints

- `GET /api/items` - Get all items
- `GET /api/items/{id}` - Get item by ID
- `POST /api/items` - Create new item
- `PUT /api/items/{id}` - Update item
- `DELETE /api/items/{id}` - Delete item
- `GET /api/items/search?keyword={keyword}` - Search items
- `GET /api/items/tag/{tag}` - Get items by tag
- `GET /api/items/tags` - Get all unique tags

## Usage

1. Click the blue "+" button to add a new item
2. Fill in the required fields (Title, Description, Tag)
3. Optionally add an Image URL and Link URL
4. Click "Add Item" to save
5. Use the search bar to find items
6. Click "All Tags" dropdown to filter by tag
7. Click the edit icon (pencil) to modify an item
8. Click the delete icon (trash) to remove an item
9. Click "Visit" to open the item's link in a new tab

## Technologies Used

- **Backend**: Spring Boot 3.1.5, Spring Data JPA
- **Database**: MySQL 8.0
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Build Tool**: Maven

