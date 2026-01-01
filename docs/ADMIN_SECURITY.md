# Admin Security Policy

## Overview
The Admin Dashboard (`/admin`) is strictly protected to ensure only authorized personnel can access it.

## Access Control Layers

### 1. Middleware Protection (Edge Layer)
The `middleware.ts` file acts as the first line of defense.
- **Authentication**: Checks if the user is logged in.
- **Authorization**: 
  - Verifies if the user's email is `saravn.ent@gmail.com` (Master Admin).
  - OR Checks the `profiles` table for `role = 'admin'`.
- **Action**: Redirects unauthorized users to the Home page (`/`).

### 2. Server Layout Protection (App Layer)
The `app/admin/layout.tsx` file enforces a second layer of security.
- Running on the server, it re-verifies the user's session and role.
- Prevents access even if middleware is bypassed or misconfigured.

## Master Admin
The email `saravn.ent@gmail.com` is hardcoded as a Master Admin in both layers to prevent lockout.

## Role Management
- Roles are stored in the `profiles` table.
- Admins can promote/demote other users from the User Management page (`/admin/users`).
- RLS (Row Level Security) should be configured in Supabase to ensure only admins can update roles.
