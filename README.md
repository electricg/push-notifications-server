#Push Notifications Server

Documentation, client and examples coming soon.

Start mongodb on my mac: `mongod --config /usr/local/etc/mongod.conf`

###TODO

* [ ] if send push returns an error (check which one), unsubscribe client from db
* [ ] use library (jsesc?) to parse/clean/sanitize/check msg and title in POST /special
* [ ] limit msg and title length in POST /special