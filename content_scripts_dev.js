//Copy this into /build for local dev testing
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
	console.log('Try to scan this page for an updated roster');
	for(var t in teams) {
		console.log(teams[t]);
		console.log('Comparing ' + teams[t].url + ' with ' + window.location.href);
		if (teams[t].url === window.location.href) {
			console.log('Match! ' + window.location.href);
			var urlPieces = window.location.href.split('/');
			var domainPieces = urlPieces[2].split('.');
			var currentSite = domainPieces.length > 1 ? domainPieces[domainPieces.length - 2] + '.' + domainPieces[domainPieces.length - 1] : domainPieces[0];
			if (currentSite === 'yahoo.com' && urlPieces[3] === 'b1' && parseInt(urlPieces[5]) > 0) {
				teams[t].roster = [];
				document.querySelectorAll('a[href^="https://sports.yahoo.com/mlb/players/"]')
					.forEach(e => e.href.split('/')[6] === undefined ? teams[t].roster.push({ "yahoo" : e.href.substring(37) }) : null);
				var callbacks = 0;
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
						var httpRequest = new XMLHttpRequest()
						httpRequest.onreadystatechange = function() {
							if (httpRequest.readyState == 4 && httpRequest.status == 200) {
								var data = JSON.parse(httpRequest.responseText);
								console.log(data);
								if (data.yahoo != undefined) {
									var idx = teams[t].roster.findIndex(roster => roster.yahoo == data.yahoo);
									if (idx > -1) {
										teams[t].roster[idx] = data;
									}
									database.push(data);
								}
								if (--callbacks === 0) {
									chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array after all callbacks were completed'); console.log(teams); });
									chrome.storage.local.set({ 'database': database }, () => { console.log('Setting the database array after all callbacks were completed'); console.log(database); });
								}
							}
						};
						httpRequest.open('GET', 'https://sz7ga985p9.execute-api.us-east-1.amazonaws.com/dev' + '/player?yahoo=' + teams[t].roster[r]['yahoo'])
						httpRequest.send();
						if (r > 3) {
							chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array'); console.log(teams); });
							return;
						}
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
						var httpRequest = new XMLHttpRequest()
						httpRequest.onreadystatechange = function() {
							if (httpRequest.readyState == 4 && httpRequest.status == 200) {
								var data = JSON.parse(httpRequest.responseText);
								console.log(data);
								if (data.cbs != undefined) {
									var idx = teams[t].roster.findIndex(roster => roster.cbs == data.cbs);
									data.position = teams[t].roster[idx].position;
									if (idx > -1) {
										teams[t].roster[idx] = data;
									}
									database.push(data);
								}
								if (--callbacks === 0) {
									chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array after all callbacks were completed'); console.log(teams); });
									chrome.storage.local.set({ 'database': database }, () => { console.log('Setting the database array after all callbacks were completed'); console.log(database); });
								}
							}
						};
						httpRequest.open('GET', 'https://sz7ga985p9.execute-api.us-east-1.amazonaws.com/dev' + '/player?cbs=' + teams[t].roster[r].cbs)
						httpRequest.send();
					}
				}
			} else if (window.location.href === 'https://www.thebaseballgauge.com/GameChanger.php') {
				chrome.storage.local.get(['teams','database'], items => {
					var players = items.teams.reduce((acc, t) => acc.concat(t.roster), [])
				    players = Array.from(new Set(players)).filter(p => p.mlb);
					console.log(players);
				});
			}
		}
	}
	chrome.storage.local.set({ 'teams': teams }, () => { console.log('Setting the teams array'); console.log(teams); });
	chrome.storage.local.set({ 'database': database }, () => { console.log('Setting the database array'); console.log(database); });
});