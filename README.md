# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). 

Upon registering, passwords are hashed and cookies are encrypted. Users that are not logged in are restricted from doing anything aside from logging in or registering.

URLs come with a statistic page that tell you the date/time the TinyURL was created, as well as how many clicks and unique visitors the link has, which are updated upon TinyURL visit regardless of login status. This page also allows you to edit the link or delete it.

Each time a user visits a link, it also creates additional stats, giving the specific url a collapsible table on the (`'urls/:id'`) stats page that shows the time of the latest visitor at the top with a unique ID. Followed by all visits, with the appropriate time and a randomly-generated ID.

&nbsp;
***


## Final Product
!['Screenshot of URLs index page'](https://github.com/CorgiOnNeptune/tinyapp/blob/main/docs/urls-page.png?raw=true)

&nbsp;
<details>
  <summary>Screenshots of URLs stat pages</summary>
  
  !['Screenshot of TinyURL stat page w/ no views'](https://github.com/CorgiOnNeptune/tinyapp/blob/main/docs/urls-stats-no-views.png?raw=true)
  !['Screenshot of TinyURL stat page w/ views'](https://github.com/CorgiOnNeptune/tinyapp/blob/main/docs/urls-stats-expanded.png?raw=true)

</details>
&nbsp;
<details>
  <summary>Screenshots of registration page</summary>
  
  !['Screenshot of registration page'](https://github.com/CorgiOnNeptune/tinyapp/blob/main/docs/registration-page.png?raw=true)

</details>

&nbsp;
***

## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session
- method-override

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.