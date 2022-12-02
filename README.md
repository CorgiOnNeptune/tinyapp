# TinyApp Project

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly). 

Upon registering, passwords are hashed and cookies are encrypted. Users that are not logged in are restricted from doing anything aside from logging in or registering.

URLs come with a statistic page that tell you the date/time the TinyURL was created, as well as how many clicks and unique visitors the link has, which are updated upon TinyURL visit regardless of login status. This page also allows you to edit the link or delete it.

Each time a user visits a link, it also creates additional stats, giving the specific url a collapsible table on the (`'urls/:id'`) stats page that shows the time of the latest visitor at the top with a unique ID. Followed by all visits, with the appropriate time and a randomly-generated ID.

&nbsp;
***
&nbsp;

## Final Product

!["screenshot description"](#)
!["screenshot description"](#)

&nbsp;
***
&nbsp;

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