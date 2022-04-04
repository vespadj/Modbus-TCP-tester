"use strict";

// import { mdiLightbulbOn } from '@mdi/js';
// import { mdiLightbulbOff } from '@mdi/js';
// import { mdiElectricSwitch } from '@mdi/js';
// import { mdiElectricSwitchClosed } from '@mdi/js';
const mdiLightbulbOn = "M12,6A6,6 0 0,1 18,12C18,14.22 16.79,16.16 15,17.2V19A1,1 0 0,1 14,20H10A1,1 0 0,1 9,19V17.2C7.21,16.16 6,14.22 6,12A6,6 0 0,1 12,6M14,21V22A1,1 0 0,1 13,23H11A1,1 0 0,1 10,22V21H14M20,11H23V13H20V11M1,11H4V13H1V11M13,1V4H11V1H13M4.92,3.5L7.05,5.64L5.63,7.05L3.5,4.93L4.92,3.5M16.95,5.63L19.07,3.5L20.5,4.93L18.37,7.05L16.95,5.63Z";
const mdiLightbulbOff = "M12,2C9.76,2 7.78,3.05 6.5,4.68L16.31,14.5C17.94,13.21 19,11.24 19,9A7,7 0 0,0 12,2M3.28,4L2,5.27L5.04,8.3C5,8.53 5,8.76 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H14.73L18.73,22L20,20.72L3.28,4M9,20V21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9Z";
const mdiElectricSwitch = "M1,11H3.17C3.58,9.83 4.69,9 6,9C6.65,9 7.25,9.21 7.74,9.56L14.44,4.87L15.58,6.5L8.89,11.2C8.96,11.45 9,11.72 9,12A3,3 0 0,1 6,15C4.69,15 3.58,14.17 3.17,13H1V11M23,11V13H20.83C20.42,14.17 19.31,15 18,15A3,3 0 0,1 15,12A3,3 0 0,1 18,9C19.31,9 20.42,9.83 20.83,11H23M6,11A1,1 0 0,0 5,12A1,1 0 0,0 6,13A1,1 0 0,0 7,12A1,1 0 0,0 6,11M18,11A1,1 0 0,0 17,12A1,1 0 0,0 18,13A1,1 0 0,0 19,12A1,1 0 0,0 18,11Z";
const mdiElectricSwitchClosed = "M20.83 11A3 3 0 0 0 15.18 11H8.82A3 3 0 0 0 3.17 11H1V13H3.17A3 3 0 0 0 8.82 13H15.18A3 3 0 0 0 20.83 13H23V11M6 13A1 1 0 1 1 7 12A1 1 0 0 1 6 13M18 13A1 1 0 1 1 19 12A1 1 0 0 1 18 13Z";

let myrefresh;
let the_app; // ugly copy for myrefresh
function refresh(period_val) {
	// console.log('Time is running out');

	myrefresh = setTimeout(function() {
		refresh(period_val);
	}, parseFloat(period_val) * 1000); // time in milliseconds

	// Code here
	the_app.process_modbus('read', -1, -1);
}


document.addEventListener('alpine:init', () => {
	Alpine.data('app', () => ({

		reading_in_cycle: false,

		read_all_cycle_time: 10, // seconds

		toggle_reading_in_cycle() {
			this.reading_in_cycle = !this.reading_in_cycle;

			the_app = this;

			if (this.reading_in_cycle) {
				// read all
				refresh(this.read_all_cycle_time);
			} else {
				console.log("clearTimeout(myrefresh);");
				clearTimeout(myrefresh);
			}
		},

		devices: [{
			ip: '',
			port: '',
			uid: '',
			items: [{}]
		}],

		process_modbus(mode, idDev, idItem) {
			console.log("Call of process_modbus(mode, idDev, idItem) ", mode, idDev, idItem);

			let data_to_post;
			if (idDev == -1) {
				// all
				data_to_post = this.devices;

				// set "processing" for setting disabled in button and inputs
				this.devices.forEach(device => {
					device.items.forEach(item => {
						item.processing = true;
					})
				});

			} else {
				// single address

				// AlpinejsObj -> json string -> json object
				let raw = JSON.parse(JSON.stringify(this.devices));
				// mantieni solo l'indice del device uguale a idDev
				raw = raw.filter((e, i, a) => i == idDev);
				if (raw.length !== 1) {
					alert('Incongruent data. Filtering returns ' + raw.length + ' instead of 1. \n idDev:' + idDev);
					return;
				}
				// mantieni solo l'indice dell'item uguale a idItem, dovrei avere un solo device, quindi [0]
				raw[0].items = raw[0].items.filter((e, i, a) => i == idItem);
				data_to_post = raw;

				// set "processing" for setting disabled in button and inputs
				this.devices[idDev].items[idItem].processing = true;
			}

			let url = '/server.lsp';
			if (mode == "read") {
				url = url + '?' + 'action=process_request&mode=read';
			} else if (mode == "write") {
				url = url + '?' + 'action=process_request&mode=write';
			}

			const data_to_post_stringified = JSON.stringify(data_to_post);
			this.buffer_size = data_to_post_stringified.length;

			fetch(url, {
					method: 'POST',
					cache: "no-cache",
					body: data_to_post_stringified,
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.then(response => {
					if (!response.ok) {
						alert(`Something went wrong: ${response.status} - ${response.statusText}`);
						if (idDev == -1) {
							// set "processing" for setting disabled in button and inputs
							this.devices.forEach(device => {
								device.items.forEach(item => {
									item.processing = false;
								})
							})
						} else {
							// set "processing" for setting disabled in button and inputs
							this.devices[idDev].items[idItem].processing = false;
						}
					}
					return response.json()
				})
				.then(data => {
					if (idDev == -1) {
						// all
						Object.assign(this.devices, data) // merge: Object.assign(target, source);
					} else {
						// readed and returned one single address
						// doen't work: this.devices[idDev].online = data[0].online ;
						// because at init device has not online property
						Object.assign(this.devices[idDev], { 'online': data[0].online });
						this.devices[idDev].items[idItem].value = data[0].items[0].value;
					}
					return true
				})
				.then(() => {
					if (idDev == -1) {
						// set "processing" for setting disabled in button and inputs
						this.devices.forEach(device => {
							device.items.forEach(item => {
								item.processing = false;
							})
						})
					} else {
						// set "processing" for setting disabled in button and inputs
						this.devices[idDev].items[idItem].processing = false;
					}
				})

			// Attenzione: dopo il fetch sono asincrono
		},

		load(filename) {
			// dbg: filename = '/saved_files/test1.json'; // plain text file
			fetch('/saved_files/' + filename, { cache: "no-cache" })
				.then(response => {
					if (!response.ok) alert(`Something went wrong: ${response.status} - ${response.statusText}`)
					return response.text()
				})
				.then(json_string => {
					this.devices = JSON.parse(json_string);
				})
		},

		filename: '',
		file_extension: '.json',

		save() {
			const filename = this.filename + this.file_extension;
			console.log("Save() of " + filename);

			// tranform alpine data object into a simple object
			// AlpinejsObj -> json string -> json object
			let raw = JSON.parse(JSON.stringify(this.devices));

			// === Before save ===
			// delete some properties / members
			let data_to_post = raw.map(device => {
				delete device.online;
				device.items.forEach(element => {
					delete element.processing;
					delete element.value;
				});
				return device;
			});

			console.log(data_to_post);

			const url = "server.lsp?action=save&filename=" + filename;
			fetch(url, {
					method: 'POST',
					cache: "no-cache",
					body: JSON.stringify(data_to_post),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.then(response => {
					if (!response.ok) {
						alert(`Something went wrong: ${response.status} - ${response.statusText}`)
					} else {
						// alert('File saved!');
					}
					// server serves list_files() after save
					return response.json() //this is a Promeses
				})
				.then(x => this.files = x)
				// Attenzione: dopo il fetch sono asincrono


		},

		files: [{}],

		list_files() {
			fetch('/server.lsp?action=list_files', { cache: "no-cache" })
				.then(response => {
					if (!response.ok) alert(`Something went wrong: ${response.status} - ${response.statusText}`)
					return response.json() //this is a Promeses
				})
				.then(x => this.files = x)
		},


	}))
});

function swap_dword(num) {
	// swap a doble word
	// 32 bit: 16;16 :
	// if device returns Lo;Hi
	// swap words to Hi;Lo
	const mask = 2 ** 32 - 1; // a binary number of 32 bit setted to 1 (true)
	// (((2**31-1)*2) + 1 ) // probably on 32 bit OS

	const hi_word = nn & (2 ** 16 - 1); // from actual Lo
	const lo_word = nn >> 16; // from actual Hi
	return mask & ((hi_word << 16) | lo_word);
}