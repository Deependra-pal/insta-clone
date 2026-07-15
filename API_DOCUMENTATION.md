# Instagram Clone Backend: System Architecture & Technical API Documentation

This document serves as the master guide for the Instagram Clone Backend. It contains a comprehensive architectural review, an entity-relationship diagram, a request-flow layout, an API summary, detailed endpoint specifications, and an implementation summary.

---

# Part 1: Senior Architectural Code Review

## 1. Project Structure Review
The project follows a standard **MVC (Model-View-Controller)** pattern.
- **`src/models/`**: Houses Mongoose schemas.
- **`src/controller/`**: Manages application request-response logic.
- **`src/Routes/`**: Contains Express routers.
- **`src/validations/`**: Contains Express-Validator configurations.
- **`src/middlewares/`**: Holds custom Express middlewares (e.g., `authMiddleware`).

### Code Quality Assessment:
- **Clean Separation of Concerns**: Routes handle endpoint mapping and chain validation/auth middlewares before passing execution to controllers.
- **Inconsistent Folder Casing**: The routing directory is named `Routes` (uppercase R) whereas other directories are lowercase (`controller`, `models`, `validations`). This is a minor developer style inconsistency but is handled correctly by Git.
- **Readability**: Code is well-commented, logic flow is intuitive, and error handling is wrapped consistently in `try-catch` blocks returning standard JSON structures.

---

## 2. Models & Database Design
The database uses MongoDB with Mongoose modeling four key domains: **User**, **Post**, **Comment**, and **Follow**.

- **User Model (`user.model.js`)**: Stores authentication credentials, profile data, and an array of `Post` references.
- **Post Model (`post.model.js`)**: Stores post image URLs, captions, creator reference (`owner`), comments references, and an embedded array of user `likes`.
- **Comment Model (`comment.model.js`)**: Stores comment text, a reference to the post, and a reference to the author.
- **Follow Model (`follow.model.js`)**: Junction (edge) collection linking a `followerId` to a `followingId`.

### Relational Design & Indexing:
- **Many-to-Many Connections**: Modeled cleanly.
  - The `Follow` collection represents graph edges connecting User nodes.
  - The `Comment` collection links `User` to `Post`.
- **Indexes**:
  - `User`: Unique index on `username` and `email`.
  - `Post`: Index on `owner` to speed up profile feed queries.
  - `Comment`: Indexes on `postId` and `userId` to speed up comments fetch and author lookups.
  - `Follow`: Unique compound index on `{ followerId: 1, followingId: 1 }` to prevent double-following, and a single index on `followingId` for follower counting.

---

## 3. Entity-Relationship (ER) Diagram

```text
  ┌───────────────────────────────────────────────────────────┐
  │                           USER                            │
  ├───────────────────────────────────────────────────────────┤
  │ _id (ObjectId) - PK                                       │
  │ username (String) - Unique Index                          │
  │ email (String) - Unique Index                             │
  │ password (String)                                         │
  │ profilePicture (String)                                   │
  │ bio (String)                                              │
  │ posts (Array of ObjectIds) ──► References Post            │
  └──────────────────────────┬──────────────────┬─────────────┘
                             │ 1                │ 1
                             │                  │
                             │ followerId       │ followingId
                             ▼                  ▼
                    ┌────────────────────────────────────┐
                    │               FOLLOW               │
                    ├────────────────────────────────────┤
                    │ _id (ObjectId) - PK                │
                    │ followerId (ObjectId) - FK         │
                    │ followingId (ObjectId) - FK        │
                    │ Unique Index: [follower, following]│
                    └────────────────────────────────────┘
                             │ 1 (owner)
                             ▼
  ┌───────────────────────────────────────────────────────────┐
  │                           POST                            │
  ├───────────────────────────────────────────────────────────┤
  │ _id (ObjectId) - PK                                       │
  │ image (String)                                            │
  │ imageFileId (String)                                      │
  │ caption (String)                                          │
  │ owner (ObjectId) - FK, Index ──► References User          │
  │ likes (Array of ObjectIds) ──► References User            │
  │ comments (Array of ObjectIds) ──► References Comment      │
  └──────────────────────────┬────────────────────────────────┘
                             │ 1
                             │
                             │ postId
                             ▼
  ┌───────────────────────────────────────────────────────────┐
  │                          COMMENT                          │
  ├───────────────────────────────────────────────────────────┤
  │ _id (ObjectId) - PK                                       │
  │ text (String)                                             │
  │ postId (ObjectId) - FK, Index ──► References Post         │
  │ userId (ObjectId) - FK, Index ──► References User         │
  └───────────────────────────────────────────────────────────┘
```

---

## 4. Overall Authentication & Request Flow

```text
 Client (Postman/Web)
        │
        │ 1. HTTP Request (e.g. POST /api/posts with Cookie/Bearer Token)
        ▼
 ┌──────────────┐
 │ Express App  │ (Routing Layer)
 └──────┬───────┘
        │
        │ 2. Route Protection Check
        ▼
 ┌─────────────────┐
 │ authMiddleware  │ (JWT Verification)
 └──────┬──────────┘
        │
        │ 3. If valid, attaches req.userId and calls next()
        ▼
 ┌───────────────────┐
 │ validationSchema  │ (Express-Validator checks fields/params)
 └──────┬────────────┘
        │
        │ 4. If fields are valid, calls next()
        ▼
 ┌──────────────┐
 │  Controller  │ (Runs database transaction/updates)
 └──────┬───────┘
        │
        │ 5. Returns JSON response (e.g. 200 OK / 201 Created)
        ▼
 Client Receives Standard Response Format
```

---

# Part 2: API Summary Table

| Method | Endpoint | Auth | Description |
| :--- | :--- | :---: | :--- |
| **POST** | `/api/auth/register` | No | Register a new user, hashes password, returns JWT cookie |
| **POST** | `/api/auth/login` | No | Log in with credentials, returns JWT cookie |
| **GET** | `/api/auth/get-me` | Yes | Get currently authenticated user's session profile |
| **POST** | `/api/auth/logout` | Yes | Log out user and clear auth cookies |
| **GET** | `/api/users/:userId` | Yes | Get public profile details (including follower/following counts) |
| **PUT** | `/api/users/profile` | Yes | Update authenticated user's profile details |
| **POST** | `/api/users/:userId/follow` | Yes | Toggle follow/unfollow status for a target user |
| **POST** | `/api/posts` | Yes | Create a new post (uploads image buffer to ImageKit) |
| **GET** | `/api/posts` | Yes | Retrieve all posts belonging to the logged-in user |
| **GET** | `/api/posts/:postId` | Yes | Retrieve details of a specific post |
| **PUT** | `/api/posts/:postId` | Yes | Update a post's caption (restricted to post owner) |
| **DELETE** | `/api/posts/:postId` | Yes | Delete a post and its CDN image (restricted to post owner) |
| **POST** | `/api/posts/:postId/like` | Yes | Toggle like/unlike status on a post |
| **POST** | `/api/posts/:postId/comments` | Yes | Add a comment to a post |
| **GET** | `/api/posts/:postId/comments` | Yes | Retrieve all comments on a post |
| **PUT** | `/api/comments/:commentId` | Yes | Edit a comment (restricted to comment author) |
| **DELETE** | `/api/comments/:commentId` | Yes | Delete a comment (restricted to comment author) |

---

# Part 3: Detailed API Endpoint Documentation

## Authentication Endpoints

### 1. Register User
- **Endpoint**: `POST /api/auth/register`
- **Authentication**: Not Required
- **Validation Rules**:
  - `username`: Required, must be alphanumeric.
  - `email`: Required, must be a valid email format.
  - `password`: Required, must be at least 8 characters.
- **Request Body (JSON)**:
  ```json
  {
    "username": "johndoe",
    "email": "johndoe@example.com",
    "password": "password123"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "User Registered Successfully",
    "data": {
      "user": {
        "_id": "6693bf6f3a5eb2345678abcd",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "profilePicture": "https://imagekit.io/...",
        "bio": "",
        "posts": []
      }
    }
  }
  ```
- **Error Responses**:
  - **400 Bad Request (Validation failed)**:
    ```json
    {
      "success": false,
      "message": "Validation failed",
      "data": {
        "errors": [{ "msg": "Password must be at least 8 characters", "path": "password" }]
      }
    }
    ```
  - **409 Conflict (User already exists)**:
    ```json
    {
      "success": false,
      "message": "User already exists"
    }
    ```
- **Controller Flow**:
  1. Extract `username`, `email`, and `password` from the body.
  2. Check if a user exists with matching email or username. Return `409` if true.
  3. Hash password using bcrypt (salt rounds: 10).
  4. Save user document to database.
  5. Sign a 7-day JWT with payload `{ id: user._id }`.
  6. Return `token` inside an HTTP-only cookie and send user profile object.
- **Postman Testing**:
  - **Method**: `POST`
  - **URL**: `{{base_url}}/api/auth/register`
  - **Headers**: `Content-Type: application/json`
  - **Body (raw JSON)**: Add username, email, and password.

---

### 2. Login User
- **Endpoint**: `POST /api/auth/login`
- **Authentication**: Not Required
- **Validation Rules**:
  - `password`: Required.
  - Must provide either `username` or `email` field.
- **Request Body (JSON)**:
  ```json
  {
    "username": "johndoe",
    "password": "password123"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User login successfully",
    "data": {
      "user": {
        "_id": "6693bf6f3a5eb2345678abcd",
        "username": "johndoe",
        "email": "johndoe@example.com"
      }
    }
  }
  ```
- **Error Responses**:
  - **401 Unauthorized (Invalid credentials)**:
    ```json
    {
      "success": false,
      "message": "Invalid credentials"
    }
    ```
- **Controller Flow**:
  1. Find user using email or username.
  2. Compare password hashes.
  3. Generate JWT and attach it to response cookies.
- **Postman Testing**:
  - **Method**: `POST`
  - **URL**: `{{base_url}}/api/auth/login`
  - **Body**: Send username/email and password credentials.

---

### 3. Get Current Session (Get Me)
- **Endpoint**: `GET /api/auth/get-me`
- **Authentication**: Required
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User fetched successfully",
    "data": {
      "user": {
        "_id": "6693bf6f3a5eb2345678abcd",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "profilePicture": "https://imagekit.io/...",
        "bio": ""
      }
    }
  }
  ```
- **Controller Flow**:
  1. Retrieve `req.userId` attached by `authMiddleware`.
  2. Query user by ID excluding the password field. Return `404` if not found.
- **Postman Testing**:
  - **Method**: `GET`
  - **URL**: `{{base_url}}/api/auth/get-me`

---

### 4. Logout User
- **Endpoint**: `POST /api/auth/logout`
- **Authentication**: Required
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User logged out successfully",
    "data": null
  }
  ```
- **Controller Flow**:
  1. Clear the `token` cookie.
- **Postman Testing**:
  - **Method**: `POST`
  - **URL**: `{{base_url}}/api/auth/logout`

---

## User Endpoints

### 5. Get User Profile
- **Endpoint**: `GET /api/users/:userId`
- **Authentication**: Required
- **Validation Rules**:
  - `userId`: Must be a valid MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User profile fetched successfully",
    "data": {
      "user": {
        "_id": "6693bf6f3a5eb2345678abcd",
        "fullname": "John Doe",
        "username": "johndoe",
        "email": "johndoe@example.com",
        "profilePicture": "https://imagekit.io/...",
        "bio": "Software engineer",
        "followersCount": 12,
        "followingCount": 45,
        "postsCount": 3,
        "posts": [],
        "isMe": false,
        "isFollowing": true
      }
    }
  }
  ```
- **Controller Flow**:
  1. Fetch user by parameter `userId` and populate their `posts`.
  2. Query the `Follow` collection to check if the current user follows them (`isFollowing`).
  3. Count matching relationship rows to return `followersCount` and `followingCount`.
- **Postman Testing**:
  - **Method**: `GET`
  - **URL**: `{{base_url}}/api/users/6693bf6f3a5eb2345678abcd`

---

### 6. Update User Profile
- **Endpoint**: `PUT /api/users/profile`
- **Authentication**: Required
- **Request Body (JSON)**:
  ```json
  {
    "fullname": "John Updated",
    "bio": "New Bio",
    "profilePicture": "https://new-url.jpg"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "user": {
        "_id": "6693bf6f3a5eb2345678abcd",
        "fullname": "John Updated",
        "bio": "New Bio",
        "profilePicture": "https://new-url.jpg"
      }
    }
  }
  ```
- **Controller Flow**:
  1. Perform `findByIdAndUpdate` on `req.userId` with fields provided.
- **Postman Testing**:
  - **Method**: `PUT`
  - **URL**: `{{base_url}}/api/users/profile`
  - **Body**: Send optional keys `fullname`, `bio`, or `profilePicture`.

---

### 7. Follow/Unfollow User
- **Endpoint**: `POST /api/users/:userId/follow`
- **Authentication**: Required
- **Validation Rules**:
  - `userId`: Must be a valid MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Followed user successfully",
    "data": null
  }
  ```
- **Controller Flow**:
  1. Verify the targeted user is not the logged-in user.
  2. Search for an existing document in the `Follow` collection where `followerId = req.userId` and `followingId = targetUserId`.
  3. If exists: Delete the document (unfollow).
  4. If not exists: Create the document (follow).
- **Postman Testing**:
  - **Method**: `POST`
  - **URL**: `{{base_url}}/api/users/6693bf6f3a5eb2345678abcd/follow`

---

## Post Endpoints

### 8. Create Post
- **Endpoint**: `POST /api/posts`
- **Authentication**: Required
- **Request Body (Multipart Form-Data)**:
  - `image`: File (JPEG, PNG, WEBP).
  - `caption`: String (Optional, max 500 chars).
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Post created successfully",
    "data": {
      "post": {
        "_id": "6693bfefea5671234567efgh",
        "image": "https://ik.imagekit.io/...",
        "imageFileId": "file_12345",
        "caption": "Enjoying the view",
        "owner": "6693bf6f3a5eb2345678abcd",
        "comments": []
      }
    }
  }
  ```
- **Controller Flow**:
  1. Multipurpose `multer` uploads the file to memory buffer.
  2. Validate files exist and match image mime-types.
  3. Upload the buffer to CDN (ImageKit) using `.files.upload()`.
  4. Save `postModel` referencing creator ID in `owner`.
- **Postman Testing**:
  - **Method**: `POST`
  - **URL**: `{{base_url}}/api/posts`
  - **Body (form-data)**: Key `image` as File, Key `caption` as Text.

---

### 9. Get User Posts
- **Endpoint**: `GET /api/posts`
- **Authentication**: Required
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Posts fetched successfully",
    "data": {
      "posts": [
        {
          "_id": "6693bfefea5671234567efgh",
          "image": "https://ik.imagekit.io/...",
          "caption": "Enjoying the view",
          "owner": "6693bf6f3a5eb2345678abcd"
        }
      ]
    }
  }
  ```
- **Controller Flow**:
  1. Retrieve posts where `owner` matches `req.userId`.
- **Postman Testing**:
  - **Method**: `GET`
  - **URL**: `{{base_url}}/api/posts`

---

### 10. Get Single Post Details
- **Endpoint**: `GET /api/posts/:postId`
- **Authentication**: Required
- **Validation Rules**:
  - `postId`: Must be a valid MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Post fetched successfully",
    "data": {
      "post": {
        "_id": "6693bfefea5671234567efgh",
        "image": "https://ik.imagekit.io/...",
        "caption": "Enjoying the view",
        "owner": "6693bf6f3a5eb2345678abcd",
        "likes": [],
        "comments": []
      }
    }
  }
  ```
- **Controller Flow**:
  1. Search `post` by ID. Verify ownership or access authorization.
- **Postman Testing**:
  - **Method**: `GET`
  - **URL**: `{{base_url}}/api/posts/6693bfefea5671234567efgh`

---

### 11. Update Post Caption
- **Endpoint**: `PUT /api/posts/:postId`
- **Authentication**: Required
- **Validation Rules**:
  - `postId`: Must be a valid MongoDB ObjectId.
  - `caption`: Optional (max 500 characters).
- **Request Body (JSON)**:
  ```json
  {
    "caption": "Updated Caption Text"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Post updated successfully",
    "data": {
      "post": {
        "_id": "6693bfefea5671234567efgh",
        "caption": "Updated Caption Text"
      }
    }
  }
  ```
- **Controller Flow**:
  1. Find post, assert that `post.owner` matches `req.userId` (authorization check).
  2. Update caption field and call `post.save()`.
- **Postman Testing**:
  - **Method**: `PUT`
  - **URL**: `{{base_url}}/api/posts/6693bfefea5671234567efgh`
  - **Body (JSON)**: Send new caption.

---

### 12. Delete Post
- **Endpoint**: `DELETE /api/posts/:postId`
- **Authentication**: Required
- **Validation Rules**:
  - `postId`: Must be a valid MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Post deleted successfully",
    "data": null
  }
  ```
- **Controller Flow**:
  1. Find post by ID and verify request ownership.
  2. Delete image file hosted on ImageKit using file identifier `post.imageFileId`.
  3. Perform `deleteOne()` to remove document from MongoDB.
- **Postman Testing**:
  - **Method**: `DELETE`
  - **URL**: `{{base_url}}/api/posts/6693bfefea5671234567efgh`

---

### 13. Like/Unlike Post
- **Endpoint**: `POST /api/posts/:postId/like`
- **Authentication**: Required
- **Validation Rules**:
  - `postId`: Must be a valid MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Post liked successfully",
    "data": {
      "postId": "6693bfefea5671234567efgh",
      "likesCount": 1,
      "isLiked": true
    }
  }
  ```
- **Controller Flow**:
  1. Verify target post exists in DB.
  2. Query `Like` collection to check if user has already liked the post.
  3. Toggle action: If exists, delete document (unlike); otherwise, create new document (like).
  4. Recalculate and return total count of likes documents matching `postId`.
- **Postman Testing**:
  - **Method**: `POST`
  - **URL**: `{{base_url}}/api/posts/6693bfefea5671234567efgh/like`

---

## Comment Endpoints

### 14. Create Comment
- **Endpoint**: `POST /api/posts/:postId/comments`
- **Authentication**: Required
- **Validation Rules**:
  - `postId`: Must be a valid MongoDB ObjectId.
  - `text`: Required (max 500 characters).
- **Request Body (JSON)**:
  ```json
  {
    "text": "This is a great picture!"
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Comment created successfully",
    "data": {
      "comment": {
        "_id": "6693c0afefab123456780000",
        "text": "This is a great picture!",
        "postId": "6693bfefea5671234567efgh",
        "userId": "6693bf6f3a5eb2345678abcd"
      }
    }
  }
  ```
- **Controller Flow**:
  1. Check if target post exists.
  2. Create new Comment document.
  3. Push new comment ID into `comments` array inside target Post document and call `.save()`.
- **Postman Testing**:
  - **Method**: `POST`
  - **URL**: `{{base_url}}/api/posts/6693bfefea5671234567efgh/comments`
  - **Body (JSON)**: Send text key.

---

### 15. Get Comments for Post
- **Endpoint**: `GET /api/posts/:postId/comments`
- **Authentication**: Required
- **Validation Rules**:
  - `postId`: Must be a valid MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Comments fetched successfully",
    "data": {
      "comments": [
        {
          "_id": "6693c0afefab123456780000",
          "text": "This is a great picture!",
          "userId": {
            "_id": "6693bf6f3a5eb2345678abcd",
            "username": "johndoe",
            "fullname": "John Doe",
            "profilePicture": "https://imagekit.io/..."
          }
        }
      ]
    }
  }
  ```
- **Controller Flow**:
  1. Retrieve post. Run `.populate` on its `comments` array.
  2. Nested populate on `comments.userId` to load user credentials (username, fullname, profilePicture).
- **Postman Testing**:
  - **Method**: `GET`
  - **URL**: `{{base_url}}/api/posts/6693bfefea5671234567efgh/comments`

---

### 16. Edit Comment
- **Endpoint**: `PUT /api/comments/:commentId`
- **Authentication**: Required
- **Validation Rules**:
  - `commentId`: Must be a valid MongoDB ObjectId.
  - `text`: Required (max 500 characters).
- **Request Body (JSON)**:
  ```json
  {
    "text": "This is an edited comment!"
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Comment updated successfully",
    "data": {
      "comment": {
        "_id": "6693c0afefab123456780000",
        "text": "This is an edited comment!"
      }
    }
  }
  ```
- **Controller Flow**:
  1. Verify comment exists and `comment.userId` matches `req.userId` (authorization check).
  2. Edit comment text and save.
- **Postman Testing**:
  - **Method**: `PUT`
  - **URL**: `{{base_url}}/api/comments/6693c0afefab123456780000`

---

### 17. Delete Comment
- **Endpoint**: `DELETE /api/comments/:commentId`
- **Authentication**: Required
- **Validation Rules**:
  - `commentId`: Must be a valid MongoDB ObjectId.
- **Success Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Comment deleted successfully",
    "data": null
  }
  ```
- **Controller Flow**:
  1. Retrieve comment and verify request ownership.
  2. Locate parent post and pull comment ID from `comments` array.
  3. Call `.deleteOne()` on comment document.
- **Postman Testing**:
  - **Method**: `DELETE`
  - **URL**: `{{base_url}}/api/comments/6693c0afefab123456780000`

---

# Part 4: Project Summary

### Technology Stack
- **Runtime Environment**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Atlas)
- **Object Modeling (ORM/ODM)**: Mongoose
- **Image CDN Storage**: ImageKit.io SDK
- **File Upload Middleware**: Multer
- **Token Security**: JSON Web Token (JWT) & Cookie-Parser

### Database Collections
1. **`users`**: Manages credentials, profile bio, posts list, followers link counts.
2. **`posts`**: Manages CDN image links, owner references, comments references.
3. **`comments`**: Manages comment text lines, owner references, post references.
4. **`follows`**: Directed edge collection linking follower and following pairs.
5. **`likes`**: Junction collection mapping liked post documents to liking users.

### High-Priority Architectural Recommendations
1. **Convert Embedded Comments Array**: Currently, `Post.comments` is still an array of comment ObjectIds. If a post receives thousands of comments, this array risks violating the 16MB document size limit. The comments should be completely decoupled, relying only on the `postId` back-reference inside the `Comment` model to look up comments.
2. **Implement Pagination**: All posts and comments retrieval endpoints currently load the complete document sets. Under high volume, this slows down database queries and blows up payload transit sizes. `limit()` and `skip()` offsets should be added.
3. **Add Populate Optimization**: Select only required fields when populating (e.g. `populate("userId", "username profilePicture")`) to minimize database memory overhead.
