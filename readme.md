# Drip.SC Website Starter

A mobile-first football submission website inspired by the visual direction of the supplied Drip.SC screenshots.

## Included
- Home / landing page
- Community Wall
- Filters: Clips, Goals, Fits, Boots, Skills
- Submission form
- Photo/video preview and local submission storage
- Rights/permission checkbox
- Admin login + moderation dashboard
- Approve / reject / feature / delete
- JSON export
- Responsive mobile navigation
- Brand name is configurable in `app.js`

## Demo admin
Password: `dripadmin`

Change it in `app.js` before publishing.

## Run
Open `index.html` in a browser.

## Important for a real launch
This version is a working front-end prototype. Submissions are stored in the visitor's browser using localStorage, so different users do NOT share one database.

For a real public site, connect the form/admin to a backend such as Supabase/Firebase or your own server, and use real object storage for videos/images. Add server-side authentication, file-size/type validation, rate limiting, moderation, email notifications, and a proper media-rights/consent flow.

## Rebranding later
Change:
`brandName: "Drip.SC"`

to your future name in `app.js`. The site title and visible branding update automatically.
