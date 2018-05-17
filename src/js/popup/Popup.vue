<template>
  <div id="app" style="width:400px;margin:5px;">
  		<div class="container">
  			<div class="row" v-for="team in teams">
	      		<div class="col-1">
	      			<div class="btn btn-danger">&times;</div>
	      		</div>
	      		<div class="col-8">
	      			<span v-if="team.name && !team.showNameBox" class="pointy" alt="Click to change the Name" @click.prevent="showNameBox(team)">{{ team.name }}</span>
	      			<span v-if="team.showNameBox"><input v-model="team.name" @onblur="save" /></span>
	      		</div>
	  		</div>
	  		<div class="row" v-if="isTeamPage">
		      	<button class="btn btn-primary">Add A Team From This Page</button>
	  		</div>
	  		<div class="row" v-if="!isTeamPage">
	  			<div class="alert-info">This page does not contain a team from a supported site. We currently support {{ Object.values(supportedSites).join(',') }}. If this message seems wrong, try refreshing the page.</div>
	  		</div>
  		</div>
  </div>
</template>
<script>
	import Vue from 'vue';

	export default {
		data() {
			return {
				teams: [],
				currentPage: null,
				supportedSites: {'cbssports.com': 'CBS', 'yahoo.com': 'Yahoo'}
			}
		},
		mounted() {
			if (!chrome || !chrome.storage) {
				// For local development
				this.teams = [{ url: 'http://grannywhitepikeleague.baseball.cbssports.com/teams', showNameBox: false, 'name': 'Piker' },
				{ url: 'https://baseball.fantasysports.yahoo.com/b1/38839/10', showNameBox: false, name: 'Paul' }];
			} else {
				var self = this;
				chrome.storage.local.get(['teams', 'current_page'], items => {
					console.log('Teams retrieved');
					console.log(items.teams);
					console.log('Current Page: ' + items.current_page);
					self.teams = items.teams.map(t => {
						t.showNameBox = false;
						return t;
					});
					self.currentPage = items.current_page;
					console.log(self.currentSite);
					console.log(self.currentSiteIsSupported);
					console.log(self.isTeamPage);
				});
			}
		},
		computed: {
			currentSite() {
				if (this.currentPage) {
					var domainPieces = this.currentPage.split('/')[2].split('.');
					if (domainPieces.length > 1) {
						return domainPieces[domainPieces.length - 2] + '.' + domainPieces[domainPieces.length - 1];
					} else {
						return domainPieces[0];
					}
				} else {
					return '';
				}
			},
			currentSiteIsSupported() {
				return !!this.supportedSites[this.currentSite];
			},
			isTeamPage() {
				if (this.currentPage && this.currentSiteIsSupported) {
					var urlPieces = this.currentPage.split('/');
					if (this.supportedSites[this.currentSite] === 'CBS') {
						return urlPieces[3] === 'teams';
					}
					if (this.supportedSites[this.currentSite] === 'Yahoo') {
						return urlPieces[3] === 'b1' && parseInt(urlPieces[5] > 0);
					}
				} else {
					return false;
				}
			}
		},
		methods: {
			showNameBox(team) {
				var teamIdx = this.teams.findIndex(t => t.url === team.url);
				Vue.set(this.teams[teamIdx], 'showNameBox', true);
			},
			addName(team, name) {
				// This is not right
				Vue.set(this.teams, this.teams.findIndex(t => t.url === team.url),name);
			},
			save() {
				chrome.storage.local.set({teams: this.teams});
			}
		}
  }
</script>

<style scoped lang="scss">
	.pointy {
		cursor: pointer;
	}
</style>