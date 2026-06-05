# Database Schema

KelaniXchange uses MongoDB with Mongoose models in `server/src/models`.

## User

Represents registered users, sellers, and admins.

Important fields:

- `name`
- `email`
- `password`
- `phone`
- `role`: `USER`, `SELLER`, `ADMIN`
- `status`: `active`, `blocked`, `deactivated`
- `profileImage`
- payment/profile fields
- wishlist references to listings

## Listing

Represents marketplace items.

Important fields:

- `title`
- `description`
- `category`
- `price`
- `quantity`
- `condition`: `New`, `Like New`, `Good`, `Used`
- `images`
- `location`
- `seller`: reference to `User`
- `isExchangeAvailable`
- `status`: `available`, `sold`, `reserved`, `removed`, `pending`, `active`, `rejected`, `hidden`

## Order

Represents buyer purchases and seller sales.

Important fields:

- `buyer`: reference to `User`
- `listing`: reference to `Listing`
- `seller`: reference to `User`
- `quantity`
- `paymentMethod`: `PayPal`, `PayHere`, `Card`, `Cash`, `BankTransfer`
- `paymentStatus`: `pending`, `paid`, `failed`, `cancelled`, `refunded`, `expired`
- `paymentProofUrl`
- `status`: `pending`, `processing`, `shipped`, `delivered`, `cancelled`

## LostFound

Represents lost and found posts.

Important fields:

- `postType`: `lost`, `found`
- `title`
- `description`
- `category`: ID card, wallet, electronics, books, stationery, keys, bags, clothing, other
- `location`
- `date`
- `imageUrl`
- `status`: `open`, `resolved`
- `user`: reference to `User`

## ExchangeRequest

Represents item-for-item exchange requests.

Important fields:

- `requestedListing`: reference to `Listing`
- `offeredListing`: reference to `Listing`
- `requester`: reference to `User`
- `receiver`: reference to `User`
- `message`
- `status`: `pending`, `accepted`, `completed`, `rejected`, `cancelled`
- action timestamps

## Chat

Represents a conversation between users.

Important fields:

- `participants`: references to `User`
- `listing`: optional reference to `Listing`
- `lastMessage`: reference to `Message`
- per-user delete/read metadata

## Message

Represents a chat message.

Important fields:

- `chat`: reference to `Chat`
- `sender`: reference to `User`
- `text`
- timestamps

## Notification

Represents system and user notifications.

Important fields:

- `recipient`: reference to `User`
- `type`
- `title`
- `message`
- `isRead`
- related entity fields
- optional sender reference

## Report

Represents user reports for listings.

Important fields:

- `listing`: reference to `Listing`
- `reporter`: reference to `User`
- `reason`
- `description`
- `status`: `pending`, `reviewed`, `resolved`

## Review

Represents feedback for sellers.

Important fields:

- `reviewer`: reference to `User`
- `seller`: reference to `User`
- `listing`: optional reference to `Listing`
- `sourceType`: `order`, `exchange`
- `rating`
- `comment`
