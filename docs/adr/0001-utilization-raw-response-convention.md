# Utilization returns raw responses, and only the iterator throws

The Utilization service answers every request with HTTP 200 and reports the
real outcome in the envelope's `meta.status`, so this library's transport-level
error mapping never fires against it. The obvious response is to have the
module parse the envelope and throw. We are not doing that. `getLoginEvents`
returns the unparsed response string like every other manager in this library,
and the caller reads `meta.status` as they do everywhere else.

The one exception is the iterator. `iterateLoginEvents` must parse the envelope
internally to find the Cursor that reaches the next page, and when that Cursor
is invalidated by a data load it has no way to continue. It therefore raises an
error of its own. This is forced by what the method does, not a style choice,
and it is the only place in the module where the wrapper interprets a response.

## Considered Options

**Parse responses and throw on a failing `meta.status`.** Considered at length
and rejected. It reads better at the call site and removes a whole class of
silent failure, but it makes one module behave unlike the twenty-odd others and
splits the library into two styles for consumers to learn.

**Have the iterator yield parsed events.** Rejected for the same reason. The
iterator yields one unparsed page string per iteration, so a caller parses a
page exactly as they would parse a single-page response.

## Consequences

A caller who forgets to check `meta.status` on a Utilization response will
treat a denied request as a success. That is already true of every other
manager in this library, and it is the price of consistency.

Types are published as exported typedefs describing the parsed shape, even
though the methods return `Promise<string>`. A consumer gets completion by
casting the result of `JSON.parse`. This is the closest the string-returning
convention allows to the typed surface the originating ticket asked for.
