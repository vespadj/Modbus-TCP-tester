# Modbus TCP tester

Modbus TCP tester runs on [Mako Server](https://makoserver.net/), *"a super compact and efficient Lua web framework"*, a web server portable for many OS.

## Install
- Download [Mako Server](https://makoserver.net/) and unzip
- Download this repository
- On Windows, edit `run mako modbus tcp tester Win.cmd`, adapt paths and launch, accept firewall alert
- On Linux, edit `run mako modbus tcp tester Linux.sh`, adapt paths and launch
- Verify port in the console window (usually `9357` or `80`)
- In your browser open `http://localhost` (if port is `80`) or  `http://localhost:9357/`

## Usage
After "run mako" and open then main web page, click on `Load` at bottom to load an example or start to edit your configuration

## Screenshot
![screenshot](/screenshot.png)

## Technologies
- [Mako Server](https://makoserver.net/): web server and its [Modbus TCP library](https://realtimelogic.com/ba/doc/?url=Modbus.html)
- [Alpine.js](https://alpinejs.dev/)
- [w3.css](https://www.w3schools.com/w3css/w3css_references.asp)
- json file format
- `https` should be implemented in Mako