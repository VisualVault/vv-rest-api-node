# VisualVault Node API Wrapper

The client library internal consumers use to call VisualVault HTTP APIs. This
glossary fixes the vocabulary the library exposes to those consumers.

## Language

### Tenancy

**Customer**:
An organization that holds a VisualVault subscription. A Customer owns one or
more Databases.

**Database**:
The tenant boundary a caller works inside. Every authorized client is bound to
exactly one Database, and all data a caller reads is scoped to it.
_Avoid_: CustomerDatabase, customer database

**DatabaseId**:
The GUID that identifies a Database. It is carried in the caller's token and is
never accepted as a request parameter.
_Avoid_: CustomerDatabaseId

### Utilization

**Utilization**:
The service that reports how a Database is used over time. It is a separate
VisualVault service with its own host, discovered after authorization.

**LoginEvent**:
One occurrence of a user signing in to a Database, through the UI or through
the API.
_Avoid_: Login record, login row, sign-in

**Retention Horizon**:
The oldest date the Utilization API will serve. A query that starts before it
is refused, even when the range is narrow.
_Avoid_: Retention window, retention limit, max range

**DataVersion**:
The date of the most recent load of Utilization data. It changes when the
nightly load runs, which ends the validity of any Cursor issued before it.

**Cursor**:
An opaque token that marks a caller's position in a LoginEvent query. It is
bound to both the query's date range and the DataVersion it was issued under.
_Avoid_: Page token, offset, continuation
