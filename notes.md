# Patch Notes

1. Search query returned incorrect records

 Issue

The task search SQL query used AND and OR conditions without
explicit grouping.

 How I found it

I inspected the search query and tested combinations of keyword,
status, and archived tasks. SQL operator precedence means AND is
evaluated before OR, so the original query did not apply all filters
to both title and description matches.

 What I changed

I grouped the title and description conditions:

archived = FALSE
AND
(title LIKE term OR description LIKE term)
AND
status filter

 Why

The application should never return archived tasks and should apply
the selected status filter regardless of whether the keyword matches
the title or description.



 2. Artificial request delay

 Issue

The controller calculated a query complexity score and called
Thread.sleep() before executing the database query.

How I found it

I inspected the request flow and noticed that every API request
could deliberately block a server thread.

 What I changed

Removed the artificial delay and complexity calculation.

 Why

The delay provides no functional value and increases response time.
It also wastes server threads and becomes more problematic under
concurrent traffic.



 3. Invalid pagination input

 Issue

The API accepted invalid page and pageSize values.

 How I found it

I reviewed the pagination calculation and noticed that values such
as page=0 or pageSize=-1 could produce invalid subList indexes.

What I changed

Added validation requiring:

- page >= 1
- pageSize >= 1
- pageSize <= 100

Why

Invalid client input should produce a controlled HTTP 400 response
instead of an unexpected server exception.

---

4. Invalid status input

 Issue

An unsupported status value caused TaskStatus.valueOf() to throw
IllegalArgumentException.

 How I found it

I traced the status parsing logic and tested an unsupported value.

 What I changed

Wrapped enum parsing in validation and return HTTP 400 for unsupported
values.

 Why

Client input should be validated at the API boundary and produce a
clear error response.



5. Stale frontend search responses

 Issue

Multiple search requests could be active simultaneously. An older
request could finish after a newer request and overwrite the latest
results.

 How I found it

I inspected the useTasks effect and noticed that every dependency
change started a new fetch without cancelling the previous request.

What I changed

Added AbortController support and cancel the previous request when
the search/filter changes.

 Why

The UI should display results for the user's latest search rather
than whichever network request happens to finish last.



 6. Loading and error state handling

 Issue

If an API request failed, loading was not reset to false. Previous
errors were also not cleared before a new request.

 How I found it

I followed the success and error paths in useTasks.

 What I changed

Reset error when a request starts and use finally to reset loading.

 Why

The UI must correctly represent the current request state whether
the request succeeds or fails.



 7. Pagination after filtering

 Issue

Changing the search or status filter did not reset the current page.

 How I found it

I tested filtering while viewing a later page.

 What I changed

Reset pagination to page 1 when search or status changes.

 Why

A newly filtered result set may have fewer pages than the previous
result set. Starting at page 1 prevents an apparently empty result
when matching tasks actually exist.



8. Accessibility improvements

Issue

Search/filter controls and dynamic loading/error states did not
provide enough semantic information for assistive technologies.

 What I changed

Added appropriate ARIA labels and status/alert roles.

Why

These changes improve accessibility without changing the application's
core behavior.