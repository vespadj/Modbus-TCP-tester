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

## Notes about JSON file data
Files are stored in `saved_files` at `save`, in json format: a javascript object.

During the process, a sub-set of this object is sended and returned from the web page and the `server.lsp` page that will execute the Modbus Connection.

Structure of the sub-set json data exchanged with the server.

```json
// sample data: array of devices [{...}, {...}]
//   device:
      {ip: '192.168.1.100', port: '502', uid: '255', items: [{...}, {...}]}
        item: {addr: '111', size: '1', vtype:'word', value:'to write or result'}
```
An `item` is a map to the address memory.
