
# Update Stacy Baum's Company ID

## Overview
Update the `profiles` table to set the `company_id` for Stacy Baum (s6taxandbook17@gmail.com) to match other admin accounts.

## Current State
- **User**: Stacy Baum (s6taxandbook17@gmail.com)
- **Profile ID**: 424e633f-7a24-4758-a37d-33715a1f2e26
- **Current company_id**: null
- **Target company_id**: fac613bd-c65f-42a5-b241-75afe75d53c5

## Implementation

### Step 1: Update the Profile Record
Execute a simple UPDATE statement to set the company_id:

```sql
UPDATE profiles 
SET company_id = 'fac613bd-c65f-42a5-b241-75afe75d53c5'
WHERE id = '424e633f-7a24-4758-a37d-33715a1f2e26';
```

## Result
After this update, Stacy Baum will have the same company association as other admin accounts (Eric Bledsoe, Ambrosia, etc.), ensuring consistent data across all admin users.

## Technical Note
This is a data operation (not a schema change), so it will be executed using the insert/update tool rather than the migration tool.
