
Implied hierarchy in URL structure
==================================


### Should I assume a hierarchical structure of annotation subresources?

Short answer:
No. The only assumptions you may make about the IRI paths are about the
meaning of dot segments (`./` or `../`), which you may resolve.
As far as web standards are concerned, it's totally fine for an
annotation server to serve http://anno.test/my-anno-id/versions
as `HTTP 200 OK` and send a version history, while at the same time
serving http://anno.test/my-anno-id with error `HTTP 404 Not Found`
or `HTTP 410 Gone`.

Long answer:
In the [Web Annotation Protocol, section 1.4 "Terminology"](
https://www.w3.org/TR/annotation-protocol/#terminology)
defines an "annotation" to be a "resource",
which is identified by an "IRI" which is defined in
[RFC 3987](https://tools.ietf.org/html/rfc3987).

RFC 3987 creates IRIs to extend the character set acceptable for web
identifierts, and strives to keep them conceptually similar to URIs.
Chapter 2 "IRI Syntax" thus invokes
[RFC 3986](https://tools.ietf.org/html/rfc3986)
a lot, where URIs are defined.

The IRI definition does not introduce any rules for any implied hierarchy
of the path part of an IRI. The text doesn't even contain the words
"hierarchy" or "hierarchic", not even the prefix "hierarch".
The longest prefix we can find is "hier" in the ABNF identifier "ihier-part".
However, ABNF identifiers are meant as arbitrary identifiers and do not
convey normative meaning.

Chapter 3 "Relationship between IRIs and URIs" even gives mappings in
both directions, which precludes the possibility of introducing additional
structural relationship expectations between the resources identified by
URI or IRI. That's why IRIs must not even be normalized in regards to
Unicode, stated in chapter 5.3.2.2. "Character Normalization".

The only prescribed assumption about IRI paths is that
chapter 5.3.2.4. "Path Segment Normalization"
dot segments should be resolved the same way as dot segments in URIs.

Overall, we can conclude that IRI paths are to be treated basically as if
they were URI paths, which are defined in
[RFC 3986](https://tools.ietf.org/html/rfc3986).
While chapter 3.3. "Path" starts with a nod to the popular notion of URI
paths being "usually organized in hierarchical form", the word "usually" is
key here, as this makes it an observation rather than a normative rule.
Unfortunately, the path as a whole isn't declared opaque either.
At the end of chapter 3.3. "Path", the opaqueness is confirmed only for
each individual path segment.

The reason why the path as a whole is allowed to be non-hierarchical
(except for dot segments) unfortunately seems to be just the lack of rules
against it, rather than any positive confirmation that I could refer to.
I wish there was a shortcut to help you verify my interpretation, but
it seems you'll have to do as I did an read vast parts of RFCs 3987, 3986,
1945, 9110, and 9112, just so you can then find yourself empty-handed.
















