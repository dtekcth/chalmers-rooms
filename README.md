# Chalmers Group Room service

This tool is useful for finding unbooked rooms on Chalmers.
It uses the TimeEdit API to find reserved rooms and then looking for gaps between the reservations.
Currently it has a button to add all group rooms commonly used by computer engineering students,
however bookmarks will probably be supported in the future to easily save rooms.

The application is built using Express as the backend server and has a REST api that the frontend uses
to fetch the rooms (will probably be switched out with GraphQL later).
Frontend is built with React, [Tailwind](http://tailwindcss.com/) and [SASS](https://sass-lang.com/).

## Usage

### Production
In order to run the application as production, you will need to build the application using the command:
`yarn run build` or `npm run build`

### Development
To run in development mode, you simply have to start the application using the command `yarn run start:watch`
to start the application in watch mode. This will reload the **server** when changes are made.

In order to hot-reload the clientside part of the app, you need to start the Laravel mix watcher with BrowserSync.
This is easily done with `yarn run build:watch`. BrowserSync will open the website automatically.

Note that visiting the website at the port you start it with will **not** hot-reload.
You need to go to the BrowserSync endpoint, which is usually at port :8000

## Contribution
Contributions are always welcomed, so fork away and create those pull requests for new features.
