import { baseurl } from '../../config.js';
import axios from 'axios';
import $ from 'jquery';

console.log('content_scripts for Fantasy Game Changer');
chrome.storage.local.get(function(data) {
	console.log('Application Storage:');
  	console.log(data);
}); 
chrome.storage.local.set({ 'current_page': window.location.href }, () => {});
chrome.storage.local.get(['teams', 'database'], items => {
	var teams = [];
	var database = [];
	if (items.teams) {
		teams = items.teams;
	}
	if (items.database) {
		database = items.database;
	}
	for(var t in teams) {
		if (teams[t].url === window.location.href) {
			var urlPieces = window.location.href.split('/');
			var domainPieces = urlPieces[2].split('.');
			var currentSite = domainPieces.length > 1 ? domainPieces[domainPieces.length - 2] + '.' + domainPieces[domainPieces.length - 1] : domainPieces[0];
			if (currentSite === 'yahoo.com' && urlPieces[3] === 'b1' && parseInt(urlPieces[5]) > 0) {
				teams[t].roster = [];
				// document.querySelectorAll('a[href^="https://sports.yahoo.com/mlb/players/"]')
				// 	.forEach(e => e.href.split('/')[6] === undefined ? teams[t].roster.push({ "yahoo" : e.href.substring(37) }) : null);
				document.querySelectorAll('tr[data-swap-targets]')
					.forEach(tr => {
						var position = tr.attributes['data-swap-groups'].nodeValue.split(" ").indexOf("POS-P") > -1 
							|| tr.attributes['data-swap-targets'].nodeValue.split(" ").indexOf("POS-P") > -1
							|| tr.querySelector('span').innerHTML.indexOf("P") > -1
							? "pitcher" : "batter";
						tr.querySelectorAll('a[href^="https://sports.yahoo.com/mlb/players/"]')
							.forEach(a => a.href.split('/')[6] === undefined ? teams[t].roster.push({ "yahoo": a.href.substring(37), position }) : null)
					})
				var callbacks = 0;
				console.log('Parising Yahoo');
				for(var r in teams[t].roster) {
					var databaseIdx = database.findIndex(d => d.yahoo == teams[t].roster[r].yahoo);
					if (databaseIdx > -1) {
						teams[t].roster[r] = database[databaseIdx];
					} else {
						// Wait 1 second
						var start = Date.now(), now = start;
						while (now - start < 1000) {
							now = Date.now();
						}
						callbacks++;
						axios.get(baseurl + '/player?yahoo=' + teams[t].roster[r]['yahoo'])
							.then(({data}) => {
								if (data.yahoo != undefined) {
									var idx = teams[t].roster.findIndex(roster => roster.yahoo == data.yahoo);
									data["position"] = teams[t].roster[idx].position;
									if (idx > -1) {
										teams[t].roster[idx] = data;
									}
									if (database.findIndex(d => d.yahoo == data.yahoo) === -1) {
										database.push(data);
									}
								}
								if (--callbacks === 0) {
									chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array after all callbacks were completed'); console.log(teams); });
									chrome.storage.local.set({ 'database': database }, () => { console.log('Setting the database array after all callbacks were completed'); console.log(database); });
								}
							})
							.catch(e => {
								console.log(e);
								if (--callbacks === 0) {
									chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array after all callbacks were completed'); console.log(teams); });
									chrome.storage.local.set({ 'database': database }, () => { console.log('Setting the database array after all callbacks were completed'); console.log(database); });
								}	
							});
					}
				}
			} else if (currentSite === 'cbssports.com' && urlPieces[3] === 'teams' && urlPieces.length === 4) {
				teams[t].roster = [];
				// document.querySelectorAll("a.playerLink").forEach(e => teams[t].roster.findIndex(r => r.cbs == e.href.split('/')[5]) === -1 ? teams[t].roster.push({ cbs: e.href.split('/')[5]}) : null);

				document.querySelectorAll('tr[id^="Batters_Row"]')
					.forEach(e => {
						var playerLinks = e.querySelectorAll('a.playerLink');
						if (playerLinks.length > 0 && teams[t].roster.findIndex(r => r.cbs == playerLinks[0].href.split('/')[5]) === -1) {
							teams[t].roster.push({ "cbs" : playerLinks[0].href.split('/')[5], "position": "batter" });
						}
					});
				document.querySelectorAll('tr[id^="Pitchers_Row"]')
					.forEach(e => {
						var playerLinks = e.querySelectorAll('a.playerLink');
						if (playerLinks.length > 0 && teams[t].roster.findIndex(r => r.cbs == playerLinks[0].href.split('/')[5]) === -1) {
							teams[t].roster.push({ "cbs" : playerLinks[0].href.split('/')[5], "position": "pitcher" });
						}
					});
				var callbacks = 0;
				for(var r in teams[t].roster) {
					var databaseIdx = database.findIndex(d => d.cbs == teams[t].roster[r].cbs);
					if (databaseIdx > -1) {
						teams[t].roster[r] = database[databaseIdx];
					} else {
						// Wait 1 second
						var start = Date.now(), now = start;
						while (now - start < 1000) {
							now = Date.now();
						}
						callbacks++;
						axios.get(baseurl + '/player?cbs=' + teams[t].roster[r]['cbs'])
							.then(({data}) => {
								if (data.cbs != undefined) {
									var idx = teams[t].roster.findIndex(roster => roster.cbs == data.cbs);
									data["position"] = teams[t].roster[idx].position;
									if (idx > -1) {
										teams[t].roster[idx] = data;
									}
									if (database.findIndex(d => d.cbs == data.cbs) === -1) {
										database.push(data);
									}
								}
								chrome.storage.local.set({ 'database': database }, () => { console.log('Setting the database array after one callback was completed'); console.log(database); });
								if (--callbacks === 0) {
									chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array after all callbacks were completed'); console.log(teams); });
								}
							});
					}
				}
			}
		}
	}
	chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array'); console.log(teams); });
	chrome.storage.local.set({ 'database': database }, () => { console.log('Setting the database array'); console.log(database); });
});
if (window.location.href === 'https://www.thebaseballgauge.com/GameChanger.php') {
	chrome.storage.local.get(['teams'], items => {
		var players = items.teams.reduce((acc, t) => acc.concat(t.roster), []);
		var row = 1;
		for (var p in players) {
			if (row <= 50 && players[p].mlb) {
				document.querySelector("#type_" + row).value = players[p].position.substring(0, 3);
				$("#type_" + row).change();
				debugger;
				document.querySelector("#data_" + row).value = players[p].mlb;
				row++;
			}
		}
		console.log({players});
		console.log(items.teams[0].roster.map(r => r.first_name + r.last_name + (r.mlb || '')));
		debugger;
		window.players = players;
	});
}