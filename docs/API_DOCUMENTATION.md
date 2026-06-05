# API Documentation

Base URL:

```text
http://localhost:5000/api
```

Protected routes require a JWT in the `Authorization` header:

```text
Authorization: Bearer <token>
```

## Health

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/` | No | Returns API running message. |

## Auth

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register a user. |
| `POST` | `/auth/login` | No | Log in and receive a token. |

## Users

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/users/profile` | Yes | Get current user profile. |
| `PUT` | `/users/profile` | Yes | Update profile and optional `profileImage`. |
| `GET` | `/users/search` | Yes | Search users. |
| `GET` | `/users/:id/public` | Yes | View public profile. |
| `GET` | `/users/:id/payment-profile` | Yes | View seller payment profile. |

## Listings

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/listings` | No | Browse listings. |
| `POST` | `/listings` | Yes | Create listing with up to 5 `images`. |
| `GET` | `/listings/my-listings` | Yes | Get listings created by current user. |
| `GET` | `/listings/:id` | No | Get listing details. |
| `PUT` | `/listings/:id` | Yes | Update listing and optional images. |
| `DELETE` | `/listings/:id` | Yes | Delete listing. |

## Orders

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/orders` | Yes | Create order with optional `paymentProof`. |
| `GET` | `/orders/my-orders` | Yes | View purchases. |
| `GET` | `/orders/my-sales` | Yes | View sales. |
| `PUT` | `/orders/:id/retry-payment` | Yes | Retry payment with optional proof. |
| `PUT` | `/orders/:id/cancel` | Yes | Cancel an order. |
| `DELETE` | `/orders/:id` | Yes | Delete a cancelled order from buyer view. |
| `DELETE` | `/orders/sales/:id` | Yes | Delete sale from seller view. |
| `PUT` | `/orders/sales/:id/status` | Yes | Update seller order status. |

## Lost And Found

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/lost-found` | No | List lost and found posts. |
| `POST` | `/lost-found` | Yes | Create post with optional `image`. |
| `GET` | `/lost-found/my-posts` | Yes | Get current user's posts. |
| `GET` | `/lost-found/user/my-posts` | Yes | Compatibility path for user's posts. |
| `GET` | `/lost-found/:id` | No | View post details. |
| `PATCH` | `/lost-found/:id/resolve` | Yes | Mark post as resolved. |
| `DELETE` | `/lost-found/:id` | Yes | Delete post. |

## Exchanges

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/exchanges` | Yes | Create exchange request. |
| `GET` | `/exchanges/sent` | Yes | Sent exchange requests. |
| `GET` | `/exchanges/received` | Yes | Received exchange requests. |
| `PUT` | `/exchanges/:id/accept` | Yes | Accept request. |
| `PUT` | `/exchanges/:id/complete` | Yes | Complete request. |
| `PUT` | `/exchanges/:id/reject` | Yes | Reject request. |
| `PUT` | `/exchanges/:id/cancel` | Yes | Cancel request. |
| `DELETE` | `/exchanges/:id` | Yes | Delete completed request. |

## Chat

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/chats/start` | Yes | Start or open chat. |
| `GET` | `/chats` | Yes | Get current user's chats. |
| `GET` | `/chats/unread-count` | Yes | Count unread messages. |
| `GET` | `/chats/:chatId/messages` | Yes | Get messages. |
| `PUT` | `/chats/:chatId/read` | Yes | Mark chat as read. |
| `POST` | `/chats/:chatId/messages` | Yes | Send message. |
| `DELETE` | `/chats/:chatId` | Yes | Delete chat for current user. |

## Other User Features

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `GET` | `/wishlist` | Yes | Get wishlist. |
| `POST` | `/wishlist/:listingId` | Yes | Add listing to wishlist. |
| `DELETE` | `/wishlist/:listingId` | Yes | Remove listing from wishlist. |
| `POST` | `/reports` | Yes | Report a listing. |
| `GET` | `/reports/my-reports` | Yes | View submitted reports. |
| `POST` | `/reviews` | Yes | Create review. |
| `GET` | `/reviews/seller/:sellerId` | No | Get seller reviews. |
| `GET` | `/notifications` | Yes | Get notifications. |
| `PUT` | `/notifications/:id/read` | Yes | Mark one notification read. |
| `PUT` | `/notifications/read-all` | Yes | Mark all notifications read. |
| `DELETE` | `/notifications/:id` | Yes | Delete notification. |
| `DELETE` | `/notifications` | Yes | Delete all notifications. |

## Admin

All admin routes require an authenticated `ADMIN` user.

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Dashboard stats. |
| `GET` | `/admin/users` | List users. |
| `POST` | `/admin/users` | Add user. |
| `PUT` | `/admin/users/:id/suspend` | Suspend user. |
| `PUT` | `/admin/users/:id/unsuspend` | Unsuspend user. |
| `PUT` | `/admin/users/:id/role` | Update role. |
| `PUT` | `/admin/users/:id/status` | Update status. |
| `DELETE` | `/admin/users/:id` | Delete user. |
| `GET` | `/admin/listings` | List all listings. |
| `PUT` | `/admin/listings/:id/remove` | Remove listing. |
| `PUT` | `/admin/listings/:id` | Update listing. |
| `DELETE` | `/admin/listings/:id` | Delete listing. |
| `GET` | `/admin/reports` | List reports. |
| `PUT` | `/admin/reports/:id/status` | Update report status. |
| `GET` | `/admin/lost-found` | List lost/found posts. |
| `PUT` | `/admin/lost-found/:id/status` | Update post status. |
| `DELETE` | `/admin/lost-found/:id` | Delete post. |
| `GET` | `/admin/notifications` | List admin notifications. |
| `POST` | `/admin/notifications` | Create notification. |
| `DELETE` | `/admin/notifications/:id` | Delete notification. |
| `GET` | `/admin/reviews` | List reviews. |
| `DELETE` | `/admin/reviews/:id` | Delete review. |
