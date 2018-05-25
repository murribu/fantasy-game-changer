<template>
  <div id="app" style="width:400px;margin:5px;">
  		<div class="container" v-if="currentSite != 'thebaseballgauge.com'">
  			<div class="row" v-for="team in teams">
	      		<div class="col-2">
	      			<div class="btn btn-danger" @click.prevent="remove(team)">&times;</div>
	      		</div>
	      		<div class="col-6">
	      			<span v-if="team.name && !team.editing" 
	      				class="pointy" 
	      				alt="Click to change the Name" 
	      				@click.prevent="team.editing = true">{{ team.name }}</span>
	      			<span v-if="team.editing"><input v-model="team.name" @blur="team.editing = false" class="team-name" /></span>
	      		</div>
	      		<div class="col-2">
	      			<a :href="team.url" target="_new">Visit</a>
	      		</div>
	      		<div class="col-1">
	      			<a v-if="team.roster" 
	      			href="#" 
	      			@click.prevent="viewRoster(team)"
	      			class="btn btn-default">View Roster</a>
	      		</div>
	  		</div>
	  		<div class="row" v-if="isTeamPage">
		      	<button class="btn btn-primary" @click.prevent="addTeam">Add A Team From This Page</button>
	  		</div>
	  		<div class="row" v-if="!isTeamPage">
	  			<div class="alert-info">This page does not contain a team from a supported site. We currently support {{ Object.values(supportedSites).join(',') }}. If this message seems wrong, try refreshing the page.</div>
	  		</div>
  		</div>
  		<div class="container" v-if="currentSite == 'thebaseballgauge.com'">
  			<h1>Yo</h1>
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
		watch: {
			teams: {
				handler: function (val, oldVal) {
					console.log('teams changed');
					chrome.storage.local.set({'teams': this.teams});
				},
				deep: true
		    }
		},
		created() {
			if (!chrome || !chrome.storage) {
				// For local development
				this.teams = [{ id: 1, url: 'http://grannywhitepikeleague.baseball.cbssports.com/teams', editing: false, 'name': 'Piker' },
				{ id: 2, url: 'https://baseball.fantasysports.yahoo.com/b1/38839/10', editing: false, name: 'Paul' }];
			} else {
				var self = this;
				chrome.storage.local.get(['teams', 'current_page'], items => {
					console.log('Teams retrieved');
					console.log(items.teams);
					console.log('Current Page: ' + items.current_page);
					self.teams = items.teams.map(t => {
						t.editing = false;
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
				console.log('Running currentSiteIsSupported');
				console.log('CurrentSite = ' + this.currentSite);
				console.log(this.supportedSites);
				return !!this.supportedSites[this.currentSite];
			},
			isTeamPage() {
				console.log('Running isTeamPage()');
				console.log('CurrentPage = ' + this.currentPage);
				if (this.currentPage && this.currentSiteIsSupported) {
					console.log('CurrentPage exists and currentSiteIsSupported is true');
					var urlPieces = this.currentPage.split('/');
					if (this.supportedSites[this.currentSite] === 'CBS') {
						return urlPieces[3] === 'teams';
					}
					if (this.supportedSites[this.currentSite] === 'Yahoo') {
						return urlPieces[3] === 'b1' && parseInt(urlPieces[5]) > 0;
					}
				} else {
					return false;
				}
			}
		},
		methods: {
			remove(team) {
				if (confirm('Are you sure you want to delete this team?')) {
					this.teams.splice(this.teams.findIndex(t => t.url === team.url), 1);
				}
			},
			addTeam() {
				this.teams.push({
					id: this.teams.reduce((acc, cur) => cur.id > acc ? cur.id : acc, 0) + 1,
					url: this.currentPage,
					editing: true,
					name: this.supportedSites[this.currentSite], 
					roster: []
				})
			},
			viewRoster(team) {
				alert('Not yet implemented');
			}
		}
  }
</script>

<style scoped lang="scss">
	.pointy {
		cursor: pointer;
	}
</style>