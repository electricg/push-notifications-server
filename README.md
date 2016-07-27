#Push Notifications Server

Documentation, client and examples coming soon.

Start mongodb on my mac: `mongod --config /usr/local/etc/mongod.conf`

###TODO

* [ ] if send push returns an error (check which one), unsubscribe client from db
* [ ] use library (jsesc?) to parse/clean/sanitize/check msg and title in POST /special
* [X] limit msg and title length in POST /special
* [X] check that title is optional
* [X] msg and title counter in GET /special

###Links

* http://stackoverflow.com/a/11420667/471720