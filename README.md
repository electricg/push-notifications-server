# Push Notifications Server

Documentation, client and examples coming whenever.

Start mongodb on my mac: `mongod --config /usr/local/etc/mongod.conf`

### TODO

- [ ] update packages:
  - [ ] web-push
  - [ ] hapi
  - [ ] joi
- [ ] if send push returns an error (check which one), unsubscribe client from db
- [ ] use library (jsesc?) to parse/clean/sanitize/check msg and title in POST /special
- [x] limit msg and title length in POST /special
- [x] check that title is optional
- [x] msg and title counter in GET /special

### Links

- http://stackoverflow.com/a/11420667/471720
