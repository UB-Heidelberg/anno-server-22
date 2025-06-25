
Author ID Keys
==============

An author ID key…

* … is meant to be human readable for admin convenience.
* … should be a URL that eternally-uniquely identifies the author
  (person, role, organization, …) within your project scope.
* If you use usernames or email addresses as author ID key,
  the users-global setting `author_agent_uuid5_baseurl`
  will be used to construct a URL.
* Non-URL author ID keys must follow [these rules](authorIdKeys.rules.mjs)
  to help the server easily distinguish them from URLs.


In cases where you don't have a preference, we suggest using a
randomness-based (i.e. v4) UUID, packaged as a URL by adding the
prefix `urn:uuid:` (RFC 4122).
Linux has a UUID generator in `/proc/sys/kernel/random/uuid`.

Author ID keys that look like a URL will be used as the default
value for the Agent's `id` field. Otherwise, the Agent ID
defaults to a false-y value. False-y values for the Agent ID
will be replaced with an auto-generated UUID URL.






