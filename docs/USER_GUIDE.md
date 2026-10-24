# VifeMS User Guide

**Live application:** https://vifems.rumptycloud.app

---

## Getting started in 5 minutes

### 1. Create an account

Go to https://vifems.rumptycloud.app and click **Get started** (or navigate to `/signup`).

Fill in your name, email address, and a password (minimum 8 characters). Click **Create account**.

Alternatively, click **Sign in with Google** on the login page to use your Google account.

A welcome email will be sent to your address.

---

### 2. Create your first workspace

After logging in you will see the workspace list. Click **Create workspace** (or **Start here** if it is your first time).

This opens the **onboarding wizard** with four stages:

#### Stage 1 — Describe

Write a description of your business. Be specific — mention what you track, who your customers are, and what operations you manage. The description must be at least 50 characters.

**Examples:**
- *"We run a bespoke tailoring studio. We manage client measurements, suit orders with multiple fittings, fabric inventory by roll, and appointment scheduling."*
- *"We are a mobile phone repair shop. We track repair jobs with device details, parts used from stock, technician assignments, and customer invoices."*
- *"We operate a small bakery. We manage product recipes, daily production batches, customer pre-orders, and ingredient stock levels."*

Click **Generate workspace**.

#### Stage 2 — Review

The AI architect generates a blueprint for your workspace — a set of **modules** (your business entities) with **fields** and **relationships**.

Review the blueprint carefully:
- Click a module name to expand its fields
- Click the trash icon to remove a module or field you do not need
- Use the field type dropdown to change a field type if the AI chose incorrectly
- Click **Regenerate** if the result does not match your business — a new blueprint will be generated from your description

When you are satisfied, click **Launch workspace**.

#### Stage 3 — Launch

The system provisions your workspace. Physical database tables are created for each module. This takes a few seconds.

You will be redirected to your new workspace dashboard automatically.

---

### 3. Manage records in your dashboard

The workspace dashboard has a sidebar listing each module (e.g. Clients, Orders, Appointments).

#### Create a record

Click a module name in the sidebar, then click **+ Add record** (or the + button). A form appears with one field per blueprint definition. Fill in the values and click **Save**.

Field types are enforced: date pickers appear for date fields, toggles for boolean fields, dropdowns for select fields, and a record picker for relation fields.

#### View and edit a record

Click any row in the module table to open the record detail. Click **Edit** to modify values. Click **Save** to apply changes.

#### Delete a record

Open the record detail and click **Delete**. If other records reference this one through a relation, the delete may fail with a foreign key error — delete the child records first.

#### Search

Type in the search box above the module table to filter records. Search applies to text fields.

#### Pagination

Large tables are paginated. Use the page controls below the table to navigate.

---

### 4. Financial documents

If your workspace has modules related to sales, orders, customers, or billing, the **Financial** tab appears in the dashboard sidebar.

#### Create an invoice

1. Click **Financial** in the sidebar
2. Click **New invoice**
3. Fill in payer details, line items, currency, tax, and optional due date
4. Click **Create invoice**

The invoice is created with status **Draft**.

#### Record a payment

1. Open an invoice
2. Click **Record payment**
3. Enter amount, payment method, and optional reference number
4. Click **Confirm payment**

A confirmed payment updates the invoice balance and generates a receipt.

#### Download PDFs

- Open an invoice and click **Download PDF** to get an invoice document
- Open a receipt and click **Download PDF** to get a receipt document

> Note: Payment recording is manual bookkeeping. VifeMS does not connect to a payment processor or verify that a payment was actually received from a bank or card terminal.

---

### 5. Account settings

#### Change password

Go to `/login`, log in, and use **Change password** in your profile (if available in the current version).

#### Forgot password

On the login page, click **Forgot password**. Enter your email address. A reset link will be emailed to you (valid for 30 minutes). Click the link and enter a new password.

#### Google account

If you registered with email/password, your account is separate from any Google account on the same email address. Log in with your email and password.

---

## Limits

| Limit | Value |
|---|---|
| Workspaces per user | 25 |
| Modules per workspace | 15 |
| Fields per module | 30 |
| Business description length | 50 – 5,000 characters |

---

## Tips

- Write a detailed, specific description to get the most accurate blueprint
- Use the Review stage to remove any modules you do not need — fewer modules means a cleaner dashboard
- Relation fields connect records across modules; for example, an Order record can link to a Client record using a relation field
- Use `select` fields for status columns (e.g. Order status: Draft, Confirmed, In Progress, Completed, Cancelled)
- The workspace description is saved — click **Regenerate** as many times as needed before launching
