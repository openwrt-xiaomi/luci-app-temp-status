'use strict';
'require baseclass';
'require rpc';

return baseclass.extend({
	title       : _('Temperature'),

	tempWarning : 90,

	tempCritical: 100,

	callTempStatus: rpc.declare({
		object: 'luci.temp-status',
		method: 'getTempStatus',
		expect: { '': {} }
	}),

	load: function() {
		return L.resolveDefault(this.callTempStatus(), null);
	},

	render: function(tempData) {
		if(!tempData) return;

		let tempTable = E('table', { 'class': 'table' },
			E('tr', { 'class': 'tr table-titles' }, [
				E('th', { 'class': 'th left', 'width': '33%' }, _('Sensor')),
				E('th', { 'class': 'th left' }, _('Temperature')),
			])
		);

		let st_template = "^sensor[0-9]+_thermal$";

		for(let [k, v] of Object.entries(tempData)) {
			v.sort((a, b) => (a.number > b.number) ? 1 : (a.number < b.number) ? -1 : 0)

			let st_count = 0;
			for (let i of Object.values(v)) {
				let sensor = i.title;
				if (sensor !== undefined) {
					let st_name = sensor.match(st_template);
					if (st_name) {
						st_count += 1;
					};
				};
			};
			let st = { };
			if (st_count > 4) {
				st = { min: null, med: [ ], max: null };
			};
			let slist = [ ];

			for (let i of Object.values(v)) {
				let sensor = i.title || i.item;

				if(i.sources === undefined) {
					continue;
				};
				
				let st_name = sensor.match(st_template);

				for (let j of i.sources) {
					let name = sensor;
					if (Object.keys(i.sources).length > 1) {
						if (j.label !== undefined) {
							name += " / " + j.label;
						} else if (j.item !== undefined) {
							name += " / " + j.item.replace(/_input$/, "");
						};
					};
					let temp = j.temp;
					if (temp !== undefined) {
						temp = Number((temp / 1000).toFixed(1));
					};
					if (temp !== undefined && st_name && st.min !== undefined) {
						st.med.push(temp);
						if (st.min == null) {
							st.min = temp;
							st.max = temp;
						} else {
							if (temp < st.min)
								st.min = temp;
							if (temp > st.max)
								st.max = temp;
						};
						continue;  // skip this temp (sensorXXX_thermal)
					};
					slist.push( { name: name, temp: temp } );
				};
			};
			
			if (st.min !== undefined && st.min != null) {
				const seq = [...st.med].sort((a, b) => a - b);
				const mid = Math.floor(seq.length / 2);
				const med = (seq.length % 2) ? seq[mid] : ((seq[mid - 1] + seq[mid]) / 2);
				st.med = Number(med.toFixed(1));
				slist.unshift( { name: "sensor_thermal / min", temp: st.min } );
				slist.unshift( { name: "sensor_thermal / median", temp: st.med } );
				slist.unshift( { name: "sensor_thermal / max", temp: st.max } );
			};
			
			if (slist.length > 0) {
				for (let s of slist) {
					let cellStyle = null;
					if (s.temp !== undefined) {
						if (s.temp >= this.tempWarning) {
							cellStyle = 'color:#f5163b !important; font-weight:bold !important'
						};
						if (s.temp >= this.tempCritical) {
							cellStyle = 'color:#ff821c !important; font-weight:bold !important'
						};
					};
					tempTable.append(
						E('tr', { 'class': 'tr' }, [
							E('td', {
									'class'     : 'td left',
									'style'     : cellStyle,
									'data-title': _('Sensor')
								},
								s.name
							),
							E('td', { 'class'   : 'td left',
									'style'     : cellStyle,
									'data-title': _('Temperature')
								},
								(s.temp === undefined) ? '-' : s.temp + ' °C'),
						])
					);
				};
			};
		};

		if(tempTable.childNodes.length === 1) {
			tempTable.append(
				E('tr', { 'class': 'tr placeholder' },
					E('td', { 'class': 'td' },
						E('em', {}, _('No temperature sensors available'))
					)
				)
			);
		};
		return tempTable;
	},
});
