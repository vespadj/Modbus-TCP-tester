"use strict";

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