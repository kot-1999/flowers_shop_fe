# Flowers Shop Frontend

- Backend repo: https://github.com/kot-1999/flowers_shop_be

The frontend application is built with **Next.js** and provides the customer and administration interfaces for the Flower Shop platform.

---

## Content

- [About Flower Shop](#about-flower-shop)
- [How to start](#how-to-start)
    - [Prerequisites](#prerequisites)
    - [Run application](#run-application)
- [Tech Stack](#tech-stack)
- [Frontend Features](#frontend-features)
- [Project Structure](#project-structure)
- [Application Overview](#application-overview)
- [License](#license)

---

## How to start

### Prerequisites

Before running the frontend application, make sure the following tools are installed:

- Node.js 22+;
- npm package manager;
- Running Flower Shop backend application.
- Stripe account

---

### Run application

The following steps describe how to run the frontend application in development mode.

1. Clone repository:

```
git clone https://github.com/kot-1999/flowers_shop_fe.git
```
2. Enter project directory: `cd flowers_shop_fe`

3. Install dependencies: `npm install`

4. Create `.env` file:

```
# Must be the same as backend has
ENCRYPTION_KEY=someKey

BACKEND_URL=http://localhost:3000

# Your public stripe key from stripe dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

5. Start development server: `npm run dev`
---

## Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5.9
- **UI Library:** Ant Design 6.4
- **Styling:** Tailwind CSS 4
- **React:** React 19.2
- **Payments:** Stripe Elements
- **Internationalization:** react-intl, i18next-parser
- **Linting:** ESLint 9 with Next.js configuration

---

## Frontend Features

The application provides:

- Multi-language support:
    - English
    - Ukrainian
    - German
    - Slovak

- Customer functionality:
    - Browse flower categories and products;
    - Search products;
    - View product details;
    - Manage basket;
    - Complete checkout process;
    - Select shipping options;
    - Pay using Stripe;
    - Manage profile and addresses;
    - View order history.

- Authentication:
    - Email/password authentication;
    - Google OAuth login;
    - Password recovery flow.

- Administration panel:
    - Dashboard;
    - Product management;
    - Category management;
    - Item type management;
    - Selectionist management;
    - Tag management;
    - User management;
    - Order management.

- AI integration:
    - Product metadata generation;
    - Translation assistance.

---

## Project Structure
```angular2html
app
├── api                 # Next.js API routes acting as backend proxy
├── components          # Reusable UI components
├── i18n                # Internationalization configuration
├── [locale]            # Localized application routes
│   ├── auth            # Authentication pages
│   ├── basket          # Basket and checkout pages
│   ├── management      # Admin panel pages
│   ├── orders          # Customer orders
│   ├── profile         # User profile
│   └── page.tsx        # Home page
├── utils               # Shared utilities, helpers and services
└── globals.css         # Global styles
```

## Application Overview

The Flower Shop frontend provides a complete e-commerce experience for customers and a management interface for administrators.

---

### Customer Interface

The customer interface allows users to browse and purchase products through a simple and responsive UI.

Main features:

- Browse products by categories;
- Search products;
- View product details;
- Add products to basket;
- Manage basket items;
- Complete checkout process;
- Select shipping options;
- Make payments through Stripe;
- View previous orders;
- Manage personal information and addresses.

---

### Admin Interface

The administration panel provides tools for managing the Flower Shop platform.

Administrators can:

- Manage products;
- Create and update categories;
- Manage item types;
- Manage product tags;
- Manage selectionists;
- View and process customer orders;
- Manage users.

---

### Authentication Flows

The application supports multiple authentication methods.

Available flows:

- User registration with email and password;
- User login;
- Google OAuth authentication;
- Password recovery;
- Session-based authentication.

---

### Basket and Checkout Flow

The checkout process is implemented as a multi-step flow:

1. Review basket items;
2. Provide customer information;
3. Select or enter delivery address;
4. Select shipping method;
5. Complete payment using Stripe;
6. Create order after successful payment.

The checkout process integrates:

- Basket management;
- Address validation;
- Shipping rate calculation;
- Stripe payment confirmation;
- Order creation.

---

### Payment Processing

Payments are handled using Stripe.

The payment flow:

1. Frontend initializes Stripe Elements;
2. Backend creates a Payment Intent;
3. Customer enters payment details;
4. Stripe processes payment securely;
5. Backend receives webhook events;
6. Order status is updated.

Supported features:

- Secure card payments;
- Payment status tracking;
- Failed payment handling;
- Order state updates.

---

### Shipping Management

Shipping functionality is integrated with Shippo.

The application supports:

- Retrieving available shipping rates;
- Selecting delivery methods;
- Creating shipping transactions;
- Displaying shipment status.

---

### AI Assistant

The application integrates a local AI assistant powered by Ollama.

AI features include:

- Product metadata generation;
- Translation assistance;
- Automated content processing.

The assistant runs locally and communicates with the application through an HTTP API.

---

## License

This project is licensed under the MIT License.

You are free to:

- Use the project for personal or commercial purposes;
- Modify the source code;
- Distribute copies of the project.

The software is provided "as is", without warranty of any kind.