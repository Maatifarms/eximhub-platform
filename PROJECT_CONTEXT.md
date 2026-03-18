# EximHub Project Context

## What EximHub Is

EximHub is a trade intelligence and buyer discovery platform for exporters, importers, sourcing teams, and business users.

The product combines:
- contact discovery
- market intelligence
- buyer discovery
- AI-assisted trade research
- subscription-based access

## Business Goal

EximHub should help users:
- find active buyers
- understand real import/export market activity
- discover product and country opportunities
- trust the platform enough to sign up and pay

## Main Product Areas

- `web/`
  Public website and user dashboard
- `api/`
  Express backend, authentication, admin/import APIs, and business logic
- `admin_panel/`
  Admin UI for imports and operations
- `mobile/`
  Android/iOS app in progress
- `database/`
  Schema, exports, imports, and setup assets

## Main Data Domains

EximHub data must stay clearly separated by use case:

### 1. Contact Data

Used for outreach and buyer/supplier discovery.

Examples:
- company name
- contact person
- email
- phone
- address
- industry
- country

### 2. Market Intelligence Data

Used for search, analysis, reports, AI answers, and business insights.

Examples:
- consignee
- shipper
- HS code
- origin/destination country
- ports
- shipment value
- quantity
- frequency

### 3. Legal / Trust / Conversion Content

Used to improve signup, payment, and trust.

Examples:
- contact information
- privacy policy
- refund policy
- onboarding emails
- payment flows

## Current Product Direction

Current priorities are:
- improve public website quality and mobile experience
- simplify signup, login, and payment flow
- strengthen trust and conversion
- improve market intelligence search
- make data ingestion cleaner and more scalable
- get the mobile app launching correctly

## Working Rule

This repository is the source of truth. No teammate or AI account should rely on memory alone for project decisions.
